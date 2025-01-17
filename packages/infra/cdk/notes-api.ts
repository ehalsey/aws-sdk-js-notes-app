import { aws_dynamodb as dynamodb, aws_lambda as lambda } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface NotesApiProps {
  /** the dynamodb table to be passed to lambda function **/
  table: dynamodb.Table;
  /** the actions which should be granted on the table */
  grantActions: string[];
}

export class NotesApi extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: NotesApiProps) {
    super(scope, id);

    const { table, grantActions } = props;

    this.handler = new lambda.Function(this, `${id}Handler`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "app.handler",
      // ToDo: find a better way to pass lambda code
      code: lambda.Code.fromAsset(`../backend/dist/${id}`),
      environment: {
        NOTES_TABLE_NAME: table.tableName,
        LOCAL_IP: "10.0.0.4",
      },
    });

    // grant the lambda role read/write permissions to notes table
    table.grant(this.handler, ...grantActions);
  }
}
