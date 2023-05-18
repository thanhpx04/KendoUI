import StoryIcon from "./icon/story.png";
import BugIcon from "./icon/bug.png";
import TaskIcon from "./icon/task.png";
import EpicIcon from "./icon/epic.png";
import SubTaskIcon from "./icon/sub-task.png"
import * as idConfig from "../../configs/idConfig";

export const issueType = [
  { id: idConfig.STORY, type: "Story", icon: StoryIcon },
  { id: idConfig.BUG, type: "Bug", icon: BugIcon },
  { id: idConfig.TASK, type: "Task", icon: TaskIcon },
  { id: idConfig.EPIC, type: "Epic", icon: EpicIcon },
  { id: idConfig.SUB_TASK, type: "Sub-task", icon: SubTaskIcon },
];

export const getIdFromIssueTypeName = (name) => {
  return issueType.find((issueType) => issueType.type === name).id;
}

export const getIconFromIssueTypeName = (name) => {
  return issueType.find((issueType) => issueType.type === name)?.icon || "";
};