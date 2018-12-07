module.exports = (sequelize, DataTypes) => {
    var Inventory = sequelize.define("Inventory", {
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        item: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    },{
		tableName: "inventories",
        timestamps: true
	});

    Inventory.associate = models => {
        Inventory.belongsTo(models.User);
        Inventory.belongsTo(models.Item);
	 };
    
    return Inventory;
};