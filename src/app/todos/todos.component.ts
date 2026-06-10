import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import { Auth } from "aws-amplify";
import { AuthStateService } from "@aws-amplify/ui-angular";

const client = generateClient<Schema>();

@Component({
  selector: "app-todos",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./todos.component.html",
  styleUrl: "./todos.component.css",
})
export class TodosComponent implements OnInit {
  todos: any[] = [];
  authState: string = "loading";
  user: any;

  constructor(private authStateService: AuthStateService) {
    this.authStateService.authState$.subscribe((authState) => {
      this.authState = authState;
      if (authState === "authenticated") {
        Auth.currentAuthenticatedUser().then((user) => (this.user = user));
      }
    });
  }

  async signOut() {
    await Auth.signOut();
  }

  ngOnInit(): void {
    this.listTodos();
  }

  listTodos() {
    try {
      client.models.Todo.observeQuery().subscribe({
        next: ({ items, isSynced }) => {
          this.todos = items;
        },
      });
    } catch (error) {
      console.error("error fetching todos", error);
    }
  }

  createTodo() {
    try {
      client.models.Todo.create({
        content: window.prompt("Todo content"),
      });
      this.listTodos();
    } catch (error) {
      console.error("error creating todos", error);
    }
  }
}
