export const TaskType = {
  Epic: '10001',
  SubTask: '10005',
};

export const AssigneeId = {
  'hoang.nguyen': '63e210d3f1475ad42c5bb79d',
  'long.vuong': '63e21185010d356379744f2f',
  'ngan.le': '63e21187c2b1cb6b34738a29',
  'tuan.nguyen8': '63e21185010d356379744f2f',
  'dung.du': '63e21189c2b1cb6b34738a2c',
  'huong.luong': '63e21187c2b1cb6b34738a29',
};

export enum GoogleSheetStatus {
  'To Do' = '10000',
  'InProgress' = '10001',
  'CodeReview' = '10003',
  'Ready4Test' = '10004',
  'DoneDev' = '10005',
  'DoneStaging' = '10002',
}

export enum JiraStatus {
  'To Do' = '10000',
  'In Progress' = '10001',
  'CODE REVIEW' = '10003',
  'READY4TEST' = '10004',
  'DONE DEV' = '10005',
  'DONE STAGING' = '10002',
}

export enum TransactionId {
  'To Do' = '11',
  'InProgress' = '21',
  'CodeReview' = '3',
  'Ready4Test' = '5',
  'DoneDev' = '7',
  'DoneStaging' = '14',
}
