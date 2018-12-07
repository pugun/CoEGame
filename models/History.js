module.exports = (sequelize, DataTypes) => {
    var History = sequelize.define("History", {
        winner: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        loser: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        }
    },{
		tableName: "histories",
        timestamps: true
	});

    History.associate = models => {
        History.belongsTo(models.User);
	 };
    
    return History;
};