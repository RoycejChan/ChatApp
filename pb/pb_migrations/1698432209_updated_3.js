/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x3qdfcfokiz7ie6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "94uj36oy",
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
  const collection = dao.findCollectionByNameOrId("x3qdfcfokiz7ie6")

  // remove
  collection.schema.removeField("94uj36oy")

  return dao.saveCollection(collection)
})
