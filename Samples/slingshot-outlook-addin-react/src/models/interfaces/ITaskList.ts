import { IDocumentInfo } from "./IDocumentInfo";
import { ITaskSection } from "./ITaskSection";

export interface ITaskList extends IDocumentInfo {
    taskSections: ITaskSection[];
}