module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        faculty: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        gender: {
            type: DataTypes.STRING(1),
            allowNull: false
        },
        facebook: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: true
        },
        gmail: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    },{
		tableName: "users",
        timestamps: true
	});

	User.associate = models => {
        User.hasMany(models.Character);
        User.hasMany(models.Inventory);
        User.hasMany(models.User_quest);
        User.hasMany(models.History);
	};
    
    return User;
};