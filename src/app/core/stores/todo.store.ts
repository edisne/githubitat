import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, map, Subscription } from "rxjs";
import { Todo } from "../models/todo";
import { TodoService } from "../services/todo.service";
import { User } from "../models/user";

@Injectable({
    providedIn: 'root'
})

export class TodoStore {

    private subject = new BehaviorSubject<Todo[]>([]);
    todos$ = this.subject.asObservable();

    todoSubscription = new Subscription;


    constructor(private todoService:TodoService) {
    
     }


    private loadTodos(){
        const user : User = JSON.parse(localStorage.getItem('user')!);

        // this.todoSubscription = this.todoService.getAll(user.id!).subscribe(todos=>{
        //     this.subject.next(todos);
        // });
    }

    get(){
       return this.todos$;
    }

    getByUser(userId : string){
        return this.todos$.pipe(
            map(todos =>{ return todos.filter(todo=>todo.userId == userId)})
        )
    }

    getById(todoId:string){
        return this.todos$.pipe(
            map(todos =>{ return todos.find(todo=>todo.id == todoId)})
        )
    }


    add(todo: Todo) {
        const todos = this.subject.getValue().slice(0);
        const index = todos.findIndex(todo=>todo.id == todo.id);
        
        if (index!=-1){
            //implement already added
        }
        else {
            todos.push(todo);
        }
        this.subject.next(todos);
        return this.todoService.save(todo);
    }

    update(todo: Todo){
        const todos = this.subject.getValue();
        const index = todos.findIndex(todo=>todo.id == todo.id);

        const newTodo: Todo ={
            ...todos[index],
            ...todo
        };
        const newTodos:Todo[] = todos.slice(0);
        newTodos[index] = newTodo;
      
        this.subject.next(newTodos);
        return this.todoService.update(todo);
    }


    remove(todo: Todo){
        const todos = this.subject.getValue().slice(0);
        const index = todos.findIndex(todo => todo.id == todo.id);
        
        if(index)
            todos.splice(index,1);
        
        this.subject.next(todos);
        return this.todoService.delete(todo.id);
    }

    clear(){
        this.subject.next([]);
    }

}