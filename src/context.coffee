Model      = require('./model')
Stage      = require('./stage')
Render     = require('./render')
Shaders    = require('./shaders')
Primitives = require('./primitives')

class Context
  constructor: (gl, scene, camera, script = []) ->

    @shaders     = new Shaders.Factory    Shaders.Snippets

    @scene       = new Render.Scene       scene
    @renderables = new Render.Factory     gl, Render.Classes, @shaders

    @attributes  = new Model.Attributes   Primitives.Traits, Primitives.Types
    @primitives  = new Primitives.Factory Primitives.Classes, @attributes, @renderables, @shaders

    @model       = new Model.Model        @primitives.make 'root'

    @controller  = new Stage.Controller   @model, @scene, @primitives
    @animator    = new Stage.Animator     @model
    @director    = new Stage.Director     @controller, @animator, script

    @api         = new Stage.API          @controller, @animator, @director

  init: () ->
    @scene.inject()

  destroy: () ->
    @scene.unject()

  update: () ->
    @animator  .update()
    @attributes.digest()

module.exports = Context
