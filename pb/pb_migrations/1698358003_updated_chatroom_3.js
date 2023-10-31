/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x3qdfcfokiz7ie6")

  collection.name = "3"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x3qdfcfokiz7ie6")

  collection.name = "chatroom_3"

  return dao.saveCollection(collection)
})
