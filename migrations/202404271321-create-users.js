module.exports = {
    tableName: "users",
    timestamp: true,
    columns: [
        {
            columnName: "id",
            dataType: "INT",
            nullable: false,
            autoIncrement: true,
        },
        {
            columnName: "roleId",
            dataType: "INT",
            nullable: true,
            references: {table:'roles', key:'id'}
        },
        {
            columnName: "username",
            dataType: "VARCHAR(100)",
            nullable: false,
            unique: true
        },
        {
            columnName: "email",
            dataType: "VARCHAR(255)",
            nullable: false
        },
        {
            columnName: "password",
            dataType: "VARCHAR(255)",
            nullable: false
        },
        {
            columnName: "name",
            dataType: "VARCHAR(50)",
            nullable: true
        },
        {
            columnName: "phone",
            dataType: "VARCHAR(50)",
            nullable: true
        },
        {
            columnName: "address",
            dataType: "VARCHAR(100)",
            nullable: true
        },
        {
            columnName: "nik",
            dataType: "VARCHAR(30)",
            nullable: true
        },
        {
            columnName: "status",
            dataType: "ENUM('active', 'inactive', 'suspended')",
            nullable: false,
            default: "'active'"
        }
    ]
}