'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Curso extends Model {
    static associate(models) {
      this.hasMany(models.Horario, {
        foreignKey: 'id_curso' ,
        as: 'horario',
      }),
      this.belongsToMany(models.Disciplina, {
        through: 'curso_disciplina',
        foreignKey: 'id_curso',
        otherKey: 'id_disciplina',
        as: 'disciplina',
        timestamps: false
      });
    }
  }
  Curso.init({
    id_curso: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome: DataTypes.STRING(100),
    carga_horaria: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Curso',
    tableName: 'curso',
    timestamps: false, 
  });
  return Curso;
};
