// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import models - DO NOT MODIFY
const { Insect, Tree, InsectTree } = require('../db/models');
const { Op } = require("sequelize");
const tree = require('../db/models/tree');

/**
 * PHASE 7 - Step A: List of all trees with insects that are near them
 *
 * Approach: Eager Loading
 *
 * Path: /trees-insects
 * Protocol: GET
 * Response: JSON array of objects
 *   - Tree properties: id, tree, location, heightFt, insects (array)
 *   - Trees ordered by the tree heightFt from tallest to shortest
 *   - Insect properties: id, name
 *   - Insects for each tree ordered alphabetically by name
 */
router.get('/trees-insects', async (req, res, next) => {
    let trees = [];

    trees = await Tree.findAll({
        attributes: ['id', 'tree', 'location', 'heightFt'],
        include: {
            model: Insect,
            attributes: ['id', 'name'],
            through: {
                attributes: []
            },
            required: true
        },
        order: [
            ['id', 'ASC'],
            [{model: Insect}, 'name', 'ASC' ]
        ]
    });

    res.json(trees);
});

/**
 * PHASE 7 - Step B: List of all insects with the trees they are near
 *
 * Approach: Lazy Loading
 *
 * Path: /insects-trees
 * Protocol: GET
 * Response: JSON array of objects
 *   - Insect properties: id, name, trees (array)
 *   - Insects for each tree ordered alphabetically by name
 *   - Tree properties: id, tree
 *   - Trees ordered alphabetically by tree
 */
router.get('/insects-trees', async (req, res, next) => {
    let payload = [];

    const insects = await Insect.findAll({
        attributes: ['id', 'name', 'description'],
        order: [ ['name'] ],
    });
    for (let i = 0; i < insects.length; i++) {
        const insect = insects[i];

        const trees = await insect.getTrees({
            attributes: ['id', 'tree'],
            joinTableAttributes: [] 
        })
        payload.push({
            id: insect.id,
            name: insect.name,
            description: insect.description,
            trees: trees
        });
    }

    res.json(payload);
});

/**
 * ADVANCED PHASE 3 - Record information on an insect found near a tree
 *
 * Path: /associate-tree-insect
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Property: tree Object
 *     with id, name, location, height, size
 *   - Property: insect Object
 *     with id, name, description, fact, territory, millimeters
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully recorded information
 *   - Property: data
 *     - Value: object (the new tree)
 * Expected Behaviors:
 *   - If tree.id is provided, then look for it, otherwise create a new tree
 *   - If insect.id is provided, then look for it, otherwise create a new insect
 *   - Relate the tree to the insect
 * Error Handling: Friendly messages for known errors
 *   - Association already exists between {tree.tree} and {insect.name}
 *   - Could not create association (use details for specific reason)
 *   - (Any others you think of)
 */
// Your code here

router.post('/associate-tree-insect', async (req, res, next) => {

    const insectReq = req.body.insect
    const treeReq = req.body.tree

    let tree;
    let insect;

    let treeExists = false;
    let insectExists = false;
    
    if(!treeReq){
        next(new Error("Tree not provided in the request"))
        return
    }else{
        if(treeReq.id){
            tree = await Tree.findByPk(treeReq.id)
    
            if(!tree){
                next(new Error("Tree not found"))
                return
            }else{
                //Future association with tree
                treeExists = true;
            }
        }else{
            tree = await Tree.create({
                tree: treeReq.name,
                location: treeReq.location,
                heightFt: treeReq.heightFt,
                groundCircumferenceFt: treeReq.size
            })
        }
    }

    if(!insectReq){
        next(new Error("Insect not provided in the request"))
        return
    }else{
        if(insectReq.id){
            insect = await Insect.findByPk(insectReq.id)

            if(!insect){
                next(new Error("Insect not found"))
                return
            }else{
                insectExists = true;
            }
        }else{
            insect = await Insect.create({
                name: insectReq.name,
                description: insectReq.description,
                fact: insectReq.fact,
                territory: insectReq.territory,
                millimeters: insectReq.millimeters
            })
        }
    }

    //Verify Association if exists

    if(insectExists && treeExists){
        const nearTrees = await insect.getTrees()
        for(let i = 0; i < nearTrees.length; i++){
            const treeIdx = nearTrees[i]

            if(treeIdx.id === tree.id){
                next(new Error(`Association already exists between ${tree.tree} and ${insect.name}`))
                return
            }
        }
    }

   
        insect.addTrees([tree])
        tree.addInsects([insect])


    res.json({
        status: "success",
        message: "Successfully created association",
        data: {
            tree: tree,
            insect: insect
        }
    })
})

// Export class - DO NOT MODIFY
module.exports = router;