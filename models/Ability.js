module.exports = (sequelize, DataTypes) => {
    var Ability = sequelize.define("Ability", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    },{
		tableName: "abilities",
        timestamps: true
	});

    // ability.associate = models => {
    //     ability.belongTo(models.item);
	//  };
    
    return Ability;
};