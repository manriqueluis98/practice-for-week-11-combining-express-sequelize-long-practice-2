// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

const {Insect} = require('../db/models');
const insect = require('../db/models/insect');

const Sequelize = require('sequelize')
const Op = Sequelize.Op

/**
 * INTERMEDIATE BONUS PHASE 2 (OPTIONAL) - Code routes for the insects
 *   by mirroring the functionality of the trees
 */
// Your code here

router.get('/', async (req, res, next) => {
    const insects = await Insect.findAll({
        attributes: ['id', 'name', 'millimeters'],
        order: [['millimeters', 'ASC']]
    })

    res.json(insects)
})

router.get('/:id', async (req, res, next) => {
    const insect = await Insect.findByPk(req.params.id)

    res.json(insect)
})

router.post('/', async (req, res, next) => {
    const insect = await Insect.build({
        name: req.body.name,
        millimeters: req.body.millimeters
    })

    await insect.save()

    res.json(insect)
})

router.delete('/:id', async (req, res, next) => {
    const insect = await Insect.findByPk(req.params.id)

    await insect.destroy()

    res.json({
        message: "Successfully deleted"
    })
})

router.put('/:id', async (req, res, next) => {
    const insect = await Insect.findByPk(req.params.id)

    insect.name = req.body.name ? req.body.name : insect.name
    insect.millimeters = req.body.millimeters ? req.body.millimeters : insect.millimeters
    
    await insect.save()

    res.json(insect)
})


router.get('/search/:value', async (req, res, next) => {
    const insects = await Insect.findAll({
        where: {
            name: {
                [Op.like]: `%${req.params.value}%`
            }
        }
    })

    res.json(insects)
})

// Export class - DO NOT MODIFY
module.exports = router;