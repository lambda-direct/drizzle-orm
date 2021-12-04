/* eslint-disable @typescript-eslint/no-unused-vars */
import { DbConnector } from '../..';
import { eq } from '../../builders';
import CitiesTable from '../tables/citiesTable';
import UserGroupsTable from '../tables/userGroupsTable';
import UsersTable from '../tables/usersTable';

(async () => {
  try {
    const db = await new DbConnector()
      .connectionString('postgresql://postgres@127.0.0.1/drizzle')
      .connect();

    const usersTable = new UsersTable(db);
    const citiesTable = new CitiesTable(db);
    const userGroupsTable = new UserGroupsTable(db);

    await usersTable.delete()
      .where(eq(usersTable.id, 1))
      .execute();

    const deletedCities = await citiesTable.delete()
      .where(eq(citiesTable.id, 2))
      .all();

    const deletedUserGroup = await userGroupsTable.delete()
      .where(eq(userGroupsTable.id, 3))
      .first();
  } catch (e) {
    console.log(e);
  }
})();