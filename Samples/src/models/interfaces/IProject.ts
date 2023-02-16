import { ITaskList } from "./ITaskList";
import { IWorkspace } from "./IWorkspace";

export interface IProject extends IWorkspace {
    taskLists: ITaskList[];
}