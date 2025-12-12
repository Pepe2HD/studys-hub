'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Professor extends Model {
    static associate(models) {
      this.hasMany(models.Horario, {
        foreignKey: 'id_professor' ,
        as: 'horario',
      });
    }
  }
  Professor.init({
    id_professor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'Professor',
    tableName: 'professor',
    timestamps: false,
  });
  return Professor;
};
