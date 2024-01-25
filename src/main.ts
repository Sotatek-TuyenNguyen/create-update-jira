import { Version3Client } from 'jira.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import {
  AssigneeId,
  GoogleSheetStatus,
  JiraStatus,
  TransactionId,
} from './config/common';

function transformDate(inputDate) {
  // Tạo một đối tượng Date hiện tại
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Tách ngày và tháng từ chuỗi đầu vào
  const [day, month] = inputDate.split('/');

  // Tạo chuỗi đầu ra theo định dạng 'YYYY-DD/MM'
  const transformedDate = `${currentYear}-${month}-${day}`;

  return transformedDate;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('process.env.GOOGLE_SHEET_ID', process.env.GOOGLE_SHEET_ID);

  const serviceAccountAuth = new JWT({
    email: 'update-jira@update-403109.iam.gserviceaccount.com',
    key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCmN0I2NAUh5WSZ\ntci9dE3JHZGtLIREXjMIfwrYir923/tMVi0boZ5CEs749upAIfCFQQtVRe061/jy\nmrkWLMcOTI4T8/1ihTDR9gYI3ZvoKDQEaWVkKglciRfDEDrwNdRrIei/pEt2UZd+\nKJw2LZqkACCjro7ydakGoHtaoikpaq+oY2SiwVAucBF1eanBrePnBHqGshXqeGWe\nzCW1b0GMXhchyGSycbc+G9p705weARLN+6lJxLDoYnLrpfmXagQyOE2lyA1LYVJT\nOYHkyQ0rRZKuCGZgmVfgLezb6/ZerOHSPda2t7ZoSieF6MQuIcBCBMQLgqYdUp4X\nJKD1UVFPAgMBAAECggEABGJfbA/sirutmaMCi9duLdM1LSeIHZ2Lzw+QI6y/5szQ\nU2/Pz3NwjzbxH/6zUxm8vxG7e3ZVZECfdRbBBxALTW9A2CSOwciC7ybZezu33w8g\nasq05/LL6GrypiyJbB30tRa3OEbceV8m6yb7EoVwF3SsEmU0/rmSdHWgi1V3rHtJ\nrHbKeLRXnhJW24weTTxc/w7SdF3KDbDbrgCVIdd4N8NqPh8fEtMbc9mwg5hnI6Ri\nmGsf1YvPL2NFfDR6Of6OqjPo7yqq9UeeJJ725j+IxSB4zlUIcdLvzPhjkXES/jKj\naHFYuJniWWIK9QB1XxyiCelmXrY0cAPPznmvJ+tdUQKBgQDgZlYjEiDj1P1AfHNc\nKlejcZrKANQP6MjIpycTFxCXWXDtSR4P3f/zFHBuHFSyLZSAQTBZk7ZTQAAwCeV2\n34wfEiItWO1McqD5CwfUUnazbHwA7P8Nh5jRNDRDps/MYvATGWgCIG3ES7WnLyW7\nFl9OBWCHNKsbTu90IPz52Qx7TQKBgQC9n2EJKupry2Lh3zYCwLQ0snQHhe4NyMhj\nYXESp4+f8jc1RMRqdYpoNFxJ7KOIF/xIx8aiPyR4oWfCapf377qmhLQFMC8MSDpc\nzQQJzQAPAm3ckavWAXkgs0DDfnfRPI6pV3ojR89IzdYayo6OVvHDge68LlP3Rmcj\nsv86qvOZCwKBgG5zsL4+dBXwhl8xYo7hAJYgmvIHClpyWDH7pI4O8kms6prBPJzO\nxubdDqIEK+Qv70JZ0/SjckDz5aO/m0SxsASzJkNv3A2e9oDe3xGxLWAPa9IA1WHR\ndnSy327VMr8Fi+m6vakeUSknotgRqt61ml+K4gJq+DXO2qoseph4L16ZAoGAfRAZ\nF8rOQboqxX5KSRZ/xCHOlQeoMj8yqxkhUoRhHcTK1L8+LFjJqGCgXcFNOf1Xz0iz\noV6z1zvdC0TyZfwexqTPdnyJCzi4BWzSNQSX/U5E1yzcgJEIKqEPHeDTdZTTIq0n\nSQ2bkRDxHUprK0X8vk17/3Euv/AXJlxwKWmGsHECgYBwP3xJwerX83C8hOS6GjfR\nTWhYg5sDrm7kTmzRygp1nZ8EU+SH39b6T2DcuGxcRhSWv/N57n49bekTdMLU4K9K\nhVOWLAoH7h9TrEr6irgtDYS/bdasutDUMchvK0zx31c6zlFCK+ESENOpo3CDSW1A\nf6xUiiZ1AoOzJcZaEk27Tg==\n-----END PRIVATE KEY-----\n',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const doc = new GoogleSpreadsheet(
    '1fChZ--blErFNixqQLlcRa3Vq5kOE_TsvO-hyeVoXaQA',
    serviceAccountAuth,
  );

  await doc.loadInfo();

  const sheet = doc.sheetsById[1755250919];
  const startRowIndex = 840; // Dòng bắt đầu
  const endRowIndex = 956; // Dòng kết thúc lay den Overall Story Progress
  const rowStart = startRowIndex - 2;
  const rowEnd = endRowIndex - 2;

  await sheet.loadCells(`A${startRowIndex}:R${endRowIndex}`);

  const rows = await sheet.getRows({
    offset: rowStart,
    limit: rowEnd - rowStart + 1,
  });
  // let listTasks = rows;
  const listTasksCreate = [];
  let groupTask = [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i]['_rawData'][4]) {
      groupTask.push(rows[i]);
    } else {
      const overallStory = {
        listTasksInStory: groupTask,
        startTime: rows[i]['_rawData'][8],
        endTime: rows[i]['_rawData'][9],
      };
      listTasksCreate.push(overallStory);
      groupTask = [];
    }
  }

  // const jira = new JiraClient({
  //   host: 'helilabs.atlassian.net/',
  //   basic_auth: {
  //     email: 'tn.hl@heli-cap.com',
  //     api_token:
  //       'ATATT3xFfGF04frwXrvXrPqZ6DhBQPT59E3XcQLXqNYfgk4fvY8xZd-i2den6k8XqoF2CUXmLfRtToST4OPZ3tIZ5EMzk0jY7gvooVSUMWCVtvwe9xljFYraSI-6D_FKUF-Ue8Ho45Vo5iy6LCe7ByOK4Zb291fJTn6WVs3wsi34CD2EgatSZyo=2DFE066B',
  //   },
  // });

  const client = new Version3Client({
    host: 'https://helilabs.atlassian.net/',
    authentication: {
      basic: {
        email: 'tn.hl@heli-cap.com',
        apiToken:
          'ATATT3xFfGF0KINBKH3fTR-m5ULJEbJ76qz0iRTM9XPRRmm19czT9RXzL4EVoXnnHItfvpwDRmSaRSq1I3oQdleSLB6biOavPC32r6Ilc4D_9gZ-ZD6al9F3lpfWhHmD6XhXhN4ifQoRuiFL6nRYLN3n9tL2KLB_2R5RFtSOyjlK6tKUZV4tXlQ=65AEA2BD',
      },
    },
  });

  // Tao task tren jira
  const createTask = async () => {
    for (const tasks of listTasksCreate) {
      const { listTasksInStory, startTime, endTime } = tasks;
      console.log('listTasksInStory', listTasksInStory[0]['_rawData']);
      // Tao story
      const issue = {
        fields: {
          project: {
            key: 'HL',
          },
          summary: `[${listTasksInStory[0]['_rawData'][1]}] ${listTasksInStory[0]['_rawData'][4]}`,
          issuetype: {
            id: '10001',
            customfield_10015: startTime && transformDate(startTime),
            duedate: endTime && transformDate(endTime),
          },
        },
      };
      console.log('issue', issue);
      const epicTask = await client.issues.createIssue(issue);
      console.log('epicTask', epicTask);

      // tao sub task
      for (const task of listTasksInStory) {
        if (!task['_rawData'][17]) {
          const issueSubTask = {
            fields: {
              project: {
                key: 'HL',
              },
              summary: `[${task['_rawData'][4]}] ${task['_rawData'][5]}`,
              issuetype: {
                id: '10005',
              },
              parent: {
                key: epicTask.key,
              },
              assignee: {
                id: AssigneeId[task['_rawData'][13]],
              },
            },
          };
          console.log('issueSub', issueSubTask);
          const subTask = await client.issues.createIssue(issueSubTask);
          console.log('subTask', subTask);
          const link = `https://helilabs.atlassian.net/browse/${subTask.key}`;
          const updateCell = sheet.getCellByA1(`R${task._rowNumber}`);
          updateCell.value = link;
          await sheet.saveUpdatedCells();
        }
      }
    }
  };

  // Update task jira
  const updateStatusTask = async () => {
    const listRowsUpdate = rows.filter((row) => !!row['_rawData'][17]);

    for (const task of listRowsUpdate) {
      // get status of jira
      const key = task['_rawData'][17].split('browse/')[1];
      console.log('task', key);
      const issue = await client.issues.getIssue({
        issueIdOrKey: key,
      });
      const status = issue.fields.status.name;
      // const assignee = issue.fields.assignee;
      // console.log('assignee', assignee);
      if (
        task['_rawData'][16] &&
        JiraStatus[status] !== GoogleSheetStatus[task['_rawData'][16]]
      ) {
        const update = await client.issues.doTransition({
          issueIdOrKey: key,
          transition: {
            id: TransactionId[task['_rawData'][16]],
            to: {
              id: GoogleSheetStatus[task['_rawData'][16]],
            },
          },
        });
        console.log(`updated task ${key}`, update);
      }
    }
    console.log('updated all tasks');
  };

  const updateAssigneeTask = async () => {
    const listRowsUpdate = rows.filter((row) => !!row['_rawData'][17]);

    for (const task of listRowsUpdate) {
      // get status of jira
      const key = task['_rawData'][17].split('browse/')[1];
      console.log('task', key);
      const issue = await client.issues.getIssue({
        issueIdOrKey: key,
      });
      const assignee = issue.fields.assignee;
      console.log(
        'so sanh',
        !assignee || assignee.accountId !== AssigneeId[task['_rawData'][13]],
      );
      if (
        !assignee ||
        assignee.accountId !== AssigneeId[task['_rawData'][13]]
      ) {
        const update = await client.issues.assignIssue({
          issueIdOrKey: key,
          accountId: AssigneeId[task['_rawData'][13]],
        });
        console.log(`updated task ${key}`, update);
        // console.log('update');
      }
    }
    console.log('updated all tasks');
  };

  const updateTimeStory = async () => {
    for (const tasks of listTasksCreate) {
      const { listTasksInStory, startTime, endTime } = tasks;
      // console.log('startTime', startTime);
      // console.log('endTime', endTime);
      const newIssueName = `[${listTasksInStory[0]['_rawData'][1]}] ${listTasksInStory[0]['_rawData'][4]}`;
      console.log('newIssueName', newIssueName);
      const key = listTasksInStory[2]['_rawData'][17].split('browse/')[1];
      const issue = await client.issues.getIssue({
        issueIdOrKey: key,
      });
      const parentKey = issue.fields.parent.key;
      console.log('parent.key', parentKey);
      // const parentIssue = await client.issues.getIssue({
      //   issueIdOrKey: parentKey,
      // });
      const update = await client.issues.editIssue({
        issueIdOrKey: issue.fields.parent.key,
        fields: {
          summary: newIssueName,
          // customfield_10015: startTime && transformDate(startTime),
          // duedate: endTime && transformDate(endTime),
        },
      });
      console.log(`updated time story ${parentKey}`, update);
    }
  };

  // createTask();
  updateStatusTask();
  // updateAssigneeTask();
  // updateTimeStory();
  // updateAssignee();

  await app.close();
}

bootstrap();
