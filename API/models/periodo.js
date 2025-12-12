'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Periodo extends Model {
    static associate(models) {
      this.hasMany(models.Horario, {
        foreignKey: 'id_periodo' ,
        as: 'horario',
      })
    }
  }
  Periodo.init({
    id_periodo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }, 
  }, {
    sequelize,
    modelName: 'Periodo',
    tableName: 'periodo',
    timestamps: false, 
  });
  return Periodo;
};
