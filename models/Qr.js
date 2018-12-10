module.exports = (sequelize, DataTypes) => {
    var Qr = sequelize.define("Qr", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        qrcode: {
            type: DataTypes.STRING(50),
            allowNull: false
        }

    },{
		tableName: "Qr",
        timestamps: true
	});

    Qr.associate = models => {
        Qr.belongsTo(models.Item);
	 };
    
    return Qr;
};