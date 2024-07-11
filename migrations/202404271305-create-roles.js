module.exports = {
    tableName: "roles",
    timestamp: true,
    columns: [
        {
            columnName: "id",
            dataType: "INT",
            nullable: false,
            autoIncrement: true
        },
        {
            columnName: "name",
            dataType: "VARCHAR(50)",
            nullable: false,
            unique: true
        },
        {
            columnName: "description",
            dataType: "VARCHAR(255)",
            nullable: true
        }
    ]
    
}
