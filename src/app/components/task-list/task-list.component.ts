import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Task {
  id?: number;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  tasks: Task[] = [];
  newTask: Task = { title: '', dueDate: '', isCompleted: false };
  markAll: boolean = false;
  apiUrl = 'http://localhost:5098/api/tasks';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.fetchTasks();
  }

  fetchTasks() {
    this.http.get<Task[]>(this.apiUrl).subscribe(data => this.tasks = data);
  }

  addTask() {
    console.log("Adding Task:", this.newTask);

    if (!this.newTask.title || !this.newTask.dueDate) {
      this.showMessage("Task title or due date is missing", true);
      return;
    }

    this.http.post<Task>(this.apiUrl, this.newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.newTask = { title: '', dueDate: '', isCompleted: false };
        this.showMessage("Task added successfully!");
      },
      error: () => this.showMessage("Error adding task", true)
    });
  }

  updateTask(task: Task) {
    this.http.put(`${this.apiUrl}/${task.id}`, task).subscribe({
      next: () => this.showMessage("Task updated successfully!"),
      error: () => this.showMessage("Error updating task", true)
    });
  }

  deleteTask(task: Task) {
    this.http.delete(`${this.apiUrl}/${task.id}`).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.showMessage("Task deleted successfully!");
      },
      error: () => this.showMessage("Error deleting task", true)
    });
  }

  toggleAll() {
    this.tasks.forEach(task => task.isCompleted = this.markAll);
    this.showMessage("All tasks updated!");
  }

  clearCompleted() {
    const completedTasks = this.tasks.filter(task => task.isCompleted);
    completedTasks.forEach(task => {
      this.http.delete(`${this.apiUrl}/${task.id}`).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
        },
        error: () => console.error("Error deleting task:", task.id)
      });
    });

    this.showMessage("Completed tasks cleared!");
  }

  remainingTasks() {
    return this.tasks.filter(task => !task.isCompleted).length;
  }

  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? 'error-snackbar' : 'success-snackbar'
    });
  }
}
