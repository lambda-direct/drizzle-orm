## All varchar suite list ## 
# Insert
1. Insert all fields to table (all, execute);
3. Insert all required fields to table (all, execute);
5. InsertMany with same model for all inserted values (all, execute);
7. Insert with onConflict statement on each field, that has such possibility(upsert)  (findOne, execute);

# Update
1. Update pool fields from table (all, execute);
2. Update 1 by 1 field from table (all, execute);
3. Update batches of several fields from table(2-3 different batches will be enough) (all, execute);

# Delete
1. Delete rows by each field values (all, execute);


## Exception cases ##
# Insert cases
1. Insert with same unique key - should have an excpetion (all, execute);
2. Insert with same primary key - should have an excpetion (all, execute);
3. Insert long string to field with fixed length;
4. Insert with wrong type;

# Update cases
1. Update with same unique key - should have an excpetion (all, execute);
2. Update with same primary key - should have an excpetion (all, execute);
3. Update long string to field with fixed length;