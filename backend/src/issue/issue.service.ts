import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { IssueStatus } from './enums/issue-status.enum';
import { GetIssuesQueryDto } from './dto/get-issues-query.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import * as crypto from 'crypto';

@Injectable()
export class IssueService implements OnModuleInit {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async onModuleInit() {
    try {
      await this.seedCategories();
    } catch (e: any) {
      console.warn('[IssueService] Failed to run onModuleInit (possibly Firestore quota exceeded):', e.message);
    }
  }

  private async seedCategories() {
    try {
      const firestore = this.firebase.getFirestore();
      const categoriesCol = firestore.collection('issue_categories');

      // Clean up any legacy Indonesian categories to keep it 100% clean and English-only!
      const legacyIndonesianIds = ['LINGKUNGAN', 'INFRASTRUKTUR', 'FASILITAS_UMUM', 'KEAMANAN'];
      for (const legacyId of legacyIndonesianIds) {
        try {
          const docRef = categoriesCol.doc(legacyId);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            await docRef.delete();
            console.log(`[IssueService] Deleted legacy Indonesian category document: ${legacyId}`);
          }
        } catch (e: any) {
          console.warn(`[IssueService] Failed to clean up legacy category ${legacyId}:`, e.message);
        }
      }

      const defaultCategories = [
        { id: 'ROAD_INFRASTRUCTURE', name: 'Road Infrastructure' },
        { id: 'PUBLIC_FACILITIES', name: 'Public Facilities' },
        { id: 'ENVIRONMENT_AND_SANITATION', name: 'Environment & Sanitation' },
        { id: 'SECURITY_AND_ORDER', name: 'Security & Order' },
      ];

      // Always upsert the clean English categories to ensure they are up to date!
      for (const cat of defaultCategories) {
        try {
          await categoriesCol.doc(cat.id).set({
            name: cat.name,
          });
        } catch (e: any) {
          console.warn(`[IssueService] Failed to seed default category ${cat.id}:`, e.message);
        }
      }
      console.log('[IssueService] Clean English categories seeded/verified successfully.');
    } catch (e: any) {
      console.warn('[IssueService] seedCategories failed:', e.message);
    }
  }

  async getCategories() {
    const firestore = this.firebase.getFirestore();
    const snapshot = await firestore.collection('issue_categories').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
  }

  async findAll(query?: GetIssuesQueryDto): Promise<any> {
    const firestore = this.firebase.getFirestore();
    const snapshot = await firestore.collection('issues').orderBy('created_at', 'desc').get();

    // Fetch categories to link
    const categories = await this.getCategories();
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    // Fetch all updates to map in-memory (prevents N+1 query issue!)
    // NOTE: We intentionally avoid orderBy() here because it requires a Firestore
    // composite index. We sort in-memory instead which is always safe.
    let updatesGrouped: Record<string, any[]> = {};
    try {
      const updatesSnapshot = await firestore.collection('issue_updates').get();
      const allUpdates = updatesSnapshot.docs.map(updateDoc => ({
        id: updateDoc.id,
        ...updateDoc.data()
      }));

      // Sort descending by created_at in-memory
      allUpdates.sort((a: any, b: any) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });

      updatesGrouped = allUpdates.reduce((acc: Record<string, any[]>, update: any) => {
        const issueId = update.issue_id;
        if (issueId) {
          if (!acc[issueId]) acc[issueId] = [];
          acc[issueId].push(update);
        }
        return acc;
      }, {});
    } catch (err) {
      console.error('[IssueService] Failed to retrieve issue updates for list view:', err.message);
    }

    let results = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      const catId = data.issue_category_id || data.category_id || 'UNKNOWN';
      const issueUpdates = updatesGrouped[doc.id] || [];
      return {
        id: doc.id,
        ...data,
        category: categoryMap[catId] || { id: catId, name: 'Unknown', english_name: 'Unknown' },
        updates: issueUpdates,
        latest_resolution: issueUpdates.length > 0 ? issueUpdates[0] : null
      };
    });

    // Apply filters in-memory
    if (query) {
      if (query.status) {
        results = results.filter(issue => issue.status === query.status);
      }
      if (query.categoryId) {
        results = results.filter(issue => {
          const catId = issue.issue_category_id || issue.category_id;
          return catId === query.categoryId;
        });
      }
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        results = results.filter(issue =>
          (issue.title && issue.title.toLowerCase().includes(searchLower)) ||
          (issue.description && issue.description.toLowerCase().includes(searchLower)) ||
          (issue.content && issue.content.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination if parameters are supplied
      if (query.page !== undefined || query.limit !== undefined) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const total = results.length;
        const totalPages = Math.ceil(total / limit) || 1;

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const slicedResults = results.slice(startIndex, endIndex);

        return {
          data: slicedResults,
          total,
          totalPages,
          page,
          limit
        };
      }
    }

    return results;
  }

  async findOne(id: string): Promise<any> {
    const firestore = this.firebase.getFirestore();
    const doc = await firestore.collection('issues').doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    const data = doc.data() as any;
    const catId = data.issue_category_id || data.category_id;
    let category: any = null;
    if (catId) {
      const categoryDoc = await firestore.collection('issue_categories').doc(catId).get();
      category = categoryDoc && categoryDoc.exists
        ? { id: categoryDoc.id, ...categoryDoc.data() }
        : { id: catId, name: 'Unknown', english_name: 'Unknown' };
    } else {
      category = data.category || { id: 'UNKNOWN', name: 'Unknown', english_name: 'Unknown' };
    }

    // Fetch related updates/history
    // NOTE: Firestore requires a composite index for .where() + .orderBy() together.
    // To avoid this, we fetch all updates and filter/sort in-memory.
    let updates: any[] = [];
    try {
      const allUpdatesSnap = await firestore.collection('issue_updates').get();
      updates = allUpdatesSnap.docs
        .map(updateDoc => ({ id: updateDoc.id, ...updateDoc.data() }))
        .filter((u: any) => u.issue_id === id)
        .sort((a: any, b: any) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
    } catch (err) {
      console.error(`[IssueService] Failed to fetch updates for issue ${id}:`, err.message);
    }

    return {
      id: doc.id,
      ...data,
      category,
      updates,
      latest_resolution: updates.length > 0 ? updates[0] : null
    };
  }

  async create(data: any) {
    const firestore = this.firebase.getFirestore();
    const result = await firestore.collection('issues').add({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      id: result.id,
      ...data
    };
  }

  async update(id: string, updateData: UpdateIssueDto, file?: any) {
    console.log('[BACKEND DEBUG] IssueService.update received updateData:', updateData);
    const firestore = this.firebase.getFirestore();
    const docRef = firestore.collection('issues').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Issue with ID ${id} not found or update failed`);
    }

    const currentData = doc.data() as any;
    console.log('[BACKEND DEBUG] IssueService.update fetched currentData:', currentData);
    let imageUrl = '';
    const status = updateData.status || currentData.status;
    const note = updateData.note || '';
    console.log('[BACKEND DEBUG] Evaluated status & note:', { status, note });

    // 1. If an image is uploaded, send it to Cloudinary Storage
    if (file) {
      try {
        imageUrl = await this.cloudinary.uploadImage(file, 'resolutions');
        console.log('[IssueService] Cloudinary upload successful, secure URL:', imageUrl);
      } catch (uploadError) {
        console.error('[IssueService] Cloudinary upload failed, proceeding without image:', uploadError.message);
        imageUrl = '';
      }
    }

    // 2. If the status is being resolved or set to unresolved, record a resolution history entry
    if (status === IssueStatus.RESOLVED || status === IssueStatus.UNRESOLVED) {
      await firestore.collection('issue_updates').add({
        issue_id: id,
        status,
        note: note,
        image_url: imageUrl || null,
        created_at: new Date().toISOString(),
      });


    }

    // 4. Update the main issue record
    const cleanedUpdateData: any = {};
    if (updateData.title !== undefined) cleanedUpdateData.title = updateData.title;
    if (updateData.description !== undefined) cleanedUpdateData.description = updateData.description;
    if (updateData.content !== undefined) cleanedUpdateData.content = updateData.content;

    // Map DTO camelCase back to Firestore snake_case
    if (updateData.categoryId !== undefined) {
      cleanedUpdateData.category_id = updateData.categoryId;
    }
    if (updateData.issueCategoryId !== undefined) {
      cleanedUpdateData.issue_category_id = updateData.issueCategoryId;
    }

    await docRef.update({
      ...cleanedUpdateData,
      status, // Make sure status is updated
      updated_at: new Date().toISOString(),
    });

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data() as any;
    const catId = data.issue_category_id || data.category_id;
    let category: any = null;
    if (catId) {
      const categoryDoc = await firestore.collection('issue_categories').doc(catId).get();
      category = categoryDoc && categoryDoc.exists
        ? { id: categoryDoc.id, ...categoryDoc.data() }
        : { id: catId, name: 'Unknown', english_name: 'Unknown' };
    } else {
      category = data.category || { id: 'UNKNOWN', name: 'Unknown', english_name: 'Unknown' };
    }

    return {
      success: true,
      message: `Issue ${id} updated successfully`,
      data: {
        id: updatedDoc.id,
        ...data,
        category,
        latest_resolution: (status === IssueStatus.RESOLVED || status === IssueStatus.UNRESOLVED) ? {
          status,
          note,
          image_url: imageUrl || null,
        } : null,
      },
    };
  }
}
