import { ISession } from '../../../db/session';

export default abstract class Expr {
  abstract toQuery({
    position, session,
  }:{
    position?: number,
    session: ISession,
  }): { query: string, values: Array<any> };
}
