import { IDocumentInfo } from "./IDocumentInfo";
import { IMemberInfo } from "./IMemberInfo";
import { IWorkspace } from "./IWorkspace";

export interface IOrganization extends IDocumentInfo {
    workspaces: IWorkspace[];
    members: IMemberInfo[];
}