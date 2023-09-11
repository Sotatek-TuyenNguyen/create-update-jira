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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('process.env.GOOGLE_SHEET_ID', process.env.GOOGLE_SHEET_ID);

  const serviceAccountAuth = new JWT({
    email: 'helix-2@helix-390508.iam.gserviceaccount.com',
    key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCKDzn8IxrP4CLC\nej6kzoskR8OYQR6PVID4W4a0ICL+6EztYcDdhtLfHFpwtWUnSA01tLYa2qRtvIJV\nYSPgDHf6AIBpzLP2nrEet5YhkEK/1dXh4Uz703II1M5WReQeV+JnwpUSh5Gp2LOQ\n5mXOr6pSPqq2iVuMwqRCRUxq43Hvl5MLRv+tYsAIdS098uV6GmzwfhC/PP5h5BjE\ntkeMevwzjkB8FA/Ci+pZ5sufZtPNqs8SIe80YLs0EVxTDiPBS3tTZNzDYWZjWCXQ\n5X/lGb8b+OqyfQuygNpDLPDZ/KqzhB6dNRQQnY15XCQDXJ6wIa6K7tO8ukzzZD4r\nI3mEiSK/AgMBAAECggEAP7N83sDX2zig8Tj0dJi0jN3r+vF5B0tHYtDgW3ZEj3di\nH1muYsiVvcpYVI7uCGzvY2tpZwShP9zuCjUTF4rJRPo8RhTkqJNaSEEPLZdhpSAm\nWt3Y5o0OndKLDjWbZwDH/3ZB0FXrOQI7AE2+hdp57Q7rN+Qy8MTSg510ABHH/XM2\nMb7nXkJ+Hi5qZ/yV3lnSFT0xRT9ouJBhgNbznzAH49XrqmLrsr8VQOGN3Z6g/qYe\nyF7zEN0lUFSa9WaAifGej6shr0Pug9KeJ0bgpUiqEMfgo5S6QEJDox6g71PTPrxo\nEJFoEwkGgKCRGfuug/UtS/t492Rem7+1gI/2xjBAeQKBgQC8DF1wNaUpR+W/aDLj\nS07SwDIsszpzZmPK3mGcxGsTOF88tQKCeca0CqgJjFlNtu5E4wnXkJXUBDaSxGH0\nxH9VsacwIZGyyNV/H9FiPuxwrIA6HFxsg7OR135rk78FzF7hc+qVt4bkpw0RzBi9\nvpp0BDWzMDnoAueTUFmOcoZlEwKBgQC78pXOcbBLUun9/RunKqQlyD1o6lGDUi68\nIdeSPNod/ubbEi5x/A3ooqTtNOdatzkt7VEBO3C0vBNpyF0c12B7ZbQUWk/K1gZA\n6mrzeqsMGfdpgMGk+T4IUE0AZxLTymx0pZ32Nnh8mUG0sEUaHd3f9PNy9yS77xIL\nvpOSpr09JQKBgQCELSjMQ1i5AGlTtbj3HKrl5eQemUf/bzu7j74Kw+EDXH9Mm2qN\nLW1mhYsBUx4+StOFphP36g/2O5Pka5byxd8+66U5Zo8TnKi8NzAkn1fwBsAGmIK6\nX4Qrgc3BbdM6DyGt1J1R6PMu6uB73vqQ/FVyMLdSIRbCprABUtvwDT278wKBgGri\nHBuZP962Ome8xzsb3tm1tGazysNZu0Y2ILgDby9bxMGU52DfLLG9vPlA+sj2Jche\ni5Cd0wyVYJzp2zoJqc7DGdPxQCtj546HQWdRvXBWXANdu8IsFAD6Wa/+7hAPr/nu\nLZTViVOifGFbVRDzJzizvrcEoZlW7fZL3PSrajcZAoGABlJWye+T902TWGPqeBTj\nfrW8spt8cUA+jA5bVUXib4ecZBJ6f7a2HG2w49567jkN7zCg4zJqnzvhI6Y13HNw\nuxbpH2temOIR3FGKdl0w2P9VdskeY0gfrjrrIB6ArX42ABKDFguEDKoi2KTJmvhP\njhT8iJ7y/p9e0FEIDsG5Wvk=\n-----END PRIVATE KEY-----\n',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(
    '1fChZ--blErFNixqQLlcRa3Vq5kOE_TsvO-hyeVoXaQA',
    serviceAccountAuth,
  );
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[3];
  const startRowIndex = 787; // Dòng bắt đầu
  const endRowIndex = 789; // Dòng kết thúc lay den Overall Story Progress
  const rowStart = startRowIndex - 2;
  const rowEnd = endRowIndex - 2;

  await sheet.loadCells(`A${startRowIndex}:R${endRowIndex}`);

  const rows = await sheet.getRows({
    offset: rowStart,
    limit: rowEnd - rowStart + 1,
  });

  // const listTask = [];
  const listTasks = [];
  let groupTask = [];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i]['_rawData'][3]) {
      groupTask.push(rows[i]);
    } else {
      listTasks.push(groupTask);
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
          'ATATT3xFfGF04frwXrvXrPqZ6DhBQPT59E3XcQLXqNYfgk4fvY8xZd-i2den6k8XqoF2CUXmLfRtToST4OPZ3tIZ5EMzk0jY7gvooVSUMWCVtvwe9xljFYraSI-6D_FKUF-Ue8Ho45Vo5iy6LCe7ByOK4Zb291fJTn6WVs3wsi34CD2EgatSZyo=2DFE066B',
      },
    },
  });

  // Tao task tren jira

  for (const tasks of listTasks) {
    // Tao story
    const issue = {
      fields: {
        project: {
          key: 'HL',
        },
        summary: tasks[0]['_rawData'][3],
        issuetype: {
          id: '10001',
        },
      },
    };
    console.log('issue', issue);
    const epicTask = await client.issues.createIssue(issue);
    console.log('epicTask', epicTask);

    // tao sub task
    for (const task of tasks) {
      const issueSubTask = {
        fields: {
          project: {
            key: 'HL',
          },
          summary: `${task['_rawData'][3]}-${task['_rawData'][4]}`,
          issuetype: {
            id: '10005',
          },
          parent: {
            key: epicTask.key,
          },
          assignee: {
            id: AssigneeId[task['_rawData'][12]],
          },
        },
      };
      console.log('issueSub', issueSubTask);
      const subTask = await client.issues.createIssue(issueSubTask);
      console.log('subTask', subTask);
      const link = `https://helilabs.atlassian.net/browse/${subTask.key}`;
      const updateCell = sheet.getCellByA1(`Q${task._rowNumber}`);
      updateCell.value = link;
      await sheet.saveUpdatedCells();
    }
  }

  // Update task jira

  // const listRowsUpdate = rows.filter((row) => !!row['_rawData'][16]);

  // for (const task of listRowsUpdate) {
  //   // get status of jira
  //   const key = task['_rawData'][16].split('browse/')[1];
  //   console.log('task', key);
  //   const issue = await client.issues.getIssue({
  //     issueIdOrKey: key,
  //   });
  //   const status = issue.fields.status.name;
  //   if (
  //     task['_rawData'][15] &&
  //     JiraStatus[status] !== GoogleSheetStatus[task['_rawData'][15]]
  //   ) {
  //     const update = await client.issues.doTransition({
  //       issueIdOrKey: key,
  //       transition: {
  //         id: TransactionId[task['_rawData'][15]],
  //         to: {
  //           id: GoogleSheetStatus[task['_rawData'][15]],
  //         },
  //       },
  //     });
  //     console.log(`updated task ${key}`, update);
  //   }
  // }
  // console.log('updated all tasks');

  await app.close();
}

bootstrap();
