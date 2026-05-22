import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueLoadFacade } from './facades/load.facade';
import { IssueUpdateFacade } from './facades/update.facade';
import { IssueTableComponent } from './components/table/table.component';
import { Router } from '@angular/router';
import { IssueStatus } from './models/issue-datatable.model';
import { ModalComponent } from '../../../shared/atoms/modal/modal.component';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { TextareaComponent } from '../../../shared/atoms/textarea/textarea.component';
import { UploadComponent } from '../../../shared/atoms/upload/upload.component';
import { HeaderComponent } from '../../../shared/molecules/header/header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-issue-datatable-main',
  standalone: true,
  imports: [
    CommonModule,
    IssueTableComponent,
    ModalComponent,
    ButtonComponent,
    TextareaComponent,
    UploadComponent,
    HeaderComponent,
    FontAwesomeModule
  ],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueDatatableComponent implements OnInit {
  protected loadFacade = inject(IssueLoadFacade);
  protected updateFacade = inject(IssueUpdateFacade);
  private router = inject(Router);

  faCheck = faCheck;
  faXmark = faXmark;

  ngOnInit() {
    this.loadFacade.loadIssues();
  }

  handlePrevPage() {
    this.loadFacade.prevPage();
  }

  handleNextPage() {
    this.loadFacade.nextPage();
  }

  handleViewDetail(id: string) {
    this.router.navigate(['/issue', id]);
  }

  handleProcessIssue(event: { id: string, status: IssueStatus }) {
    this.updateFacade.form.openDialog(event.id, event.status);
  }

  handleCloseDialog() {
    this.updateFacade.form.closeDialog();
  }

  handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.updateFacade.form.imageFile.set(input.files[0]);
    }
  }

  handleNoteChange(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.updateFacade.form.note.set(textarea.value);
  }

  handleStatusSelect(status: IssueStatus) {
    this.updateFacade.form.status.set(status);
  }

  handleSubmitDialog() {
    this.updateFacade.onSubmit();
  }
}
