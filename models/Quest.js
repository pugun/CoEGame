module.exports = (sequelize, DataTypes) => {
    var Quest = sequelize.define("Quest", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(400),
            allowNull: true
        }
    },{
		tableName: "quests",
        timestamps: true
	});

    Quest.associate = models => {
        Quest.hasMany(models.User_quest);
	 };
    
    return Quest;
};