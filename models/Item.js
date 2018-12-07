module.exports = (sequelize, DataTypes) => {
    var Item = sequelize.define("Item", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        attack: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        mattack: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        defend: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        hp: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        slot: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(400),
            allowNull: true
        },
        ability_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    },{
		tableName: "items",
        timestamps: true
	});

    Item.associate = models => {
        Item.belongsTo(models.Ability);
	 };
    
    return Item;
};