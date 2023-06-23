'use strict';

const {Insect, Tree} = require('../models');

const InsectTrees = [
  {
    insect: { name: "Western Pygmy Blue Butterfly" },
    trees: [
      { tree: "General Sherman" },
      { tree: "General Grant" },
      { tree: "Lincoln" },
      { tree: "Stagg" },
    ],
  },
  {
    insect: { name: "Patu Digua Spider" },
    trees: [
      { tree: "Stagg" },
    ],
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    for(let i = 0; i < InsectTrees.length; i++){
      const insect = InsectTrees[i].insect;
      const trees = InsectTrees[i].trees;

      const insectInstance = await Insect.findOne({
        where: {name: insect.name}
      })

      const treeInstacesArray = []

      for(let j = 0; j < trees.length; j++){
        const treeInstance = await Tree.findOne({
          where: {tree: trees[j].tree}
        })

        await treeInstance.addInsects([insectInstance])

        treeInstacesArray.push(treeInstance)
      }

      insectInstance.addTrees(treeInstacesArray)
    }

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    for(let i = 0; i < InsectTrees.length; i++){
      const insect = InsectTrees[i].insect;
      const trees = InsectTrees[i].trees;

      const insectInstance = await Insect.findOne({
        where: {name: insect.name}
      })

      const treeInstacesArray = []

      for(let j = 0; j < trees.length; j++){
        const treeInstance = await Tree.findOne({
          where: {tree: trees[j].tree}
        })

        await treeInstance.removeInsects([insectInstance])

        treeInstacesArray.push(treeInstance)
      }

      insectInstance.removeTrees(treeInstacesArray)
    }
  }
};
