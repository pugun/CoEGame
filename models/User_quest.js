module.exports = (sequelize, DataTypes) => {
    var User_quest = sequelize.define("User_quest", {
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        counter: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    },{
		tableName: "user_quests",
        timestamps: true
	});

    User_quest.associate = models => {
        User_quest.belongsTo(models.User);
        User_quest.belongsTo(models.Quest);
	 };
    
    return User_quest;
};