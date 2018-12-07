module.exports = (sequelize, DataTypes) => {
    var Character = sequelize.define("Character", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        head: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        body: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        weapon: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    },{
		tableName: "characters",
        timestamps: true
	});

    Character.associate = models => {
        Character.belongsTo(models.User);
	 };
    
    return Character;
};