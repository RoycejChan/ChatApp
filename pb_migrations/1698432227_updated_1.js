/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("no5v7hv2wfgrzm2")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "200xum0u",
    "name": "socketID",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("no5v7hv2wfgrzm2")

  // remove
  collection.schema.removeField("200xum0u")

  return dao.saveCollection(collection)
})
