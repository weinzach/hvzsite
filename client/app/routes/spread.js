import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),
  errorHandler: Ember.inject.service(),

  actions: {
    /* globals $jit */
    didTransition() {
      Ember.run.scheduleOnce('afterRender', this, () => {
        Ember.$.getScript("https://cdnjs.cloudflare.com/ajax/libs/jit/2.0.2/jit.min.js", () => {
          this.get('ajax').request('/status/infections').then((result) => {
            if (result.infections.length === 0) {
              Ember.$('#message-text').html('There were no infections found.');
              return;
            }

            var roots = {};
            var players = {};

            function getPlayer(obj) {
              var player;
              if (!players[obj.id]) {
                player = {
                  id: obj.id,
                  name: obj.name,
                  children: [],
                  data: {
                    parent: null
                  }
                };
                players[player.id] = player;
                roots[player.id] = player;
              }
              else {
                player = players[obj.id];
              }

              return player;
            }

            result.infections.forEach((inf) => {
              var zombie = getPlayer(inf.zombie);
              var human = getPlayer(inf.human);

              if (human.data.parent === null) {
                delete roots[human.id];
                zombie.children.push(human);
                human.data.parent = zombie.id;
              }
            });

            var rgraph = new $jit.RGraph({
              injectInto: 'spread-canvas',

              Navigation: {
                enable: true,
                panning: true,
                zooming: 10
              },

              Node: {
                color: '#ddeeff'
              },
              Edge: {
                color: '#c17878',
                lineWidth: 1.5
              },

              onCreateLabel: function (domElement, node) {
                domElement.innerHTML = node.name;
                domElement.onclick = function() {
                  rgraph.onClick(node.id);
                };
              },

              onPlaceLabel: function (domElement, node) {
                var style = domElement.style;
                style.display = '';
                style.cursor = 'pointer';

                style.color = 'black';
                if (node._depth <= 1) {
                  style.fontSize = '0.8em';
                }
                else {
                  style.fontSize = '0.7em';
                }

                var left = parseInt(style.left);
                var w = domElement.offsetWidth;
                style.left = (left - w / 2) + 'px';
              }
            });

            var data = [];
            for (var player in roots) {
              if (roots.hasOwnProperty(player)) {
                data.push(roots[player]);
              }
            }

            console.log(data);

            rgraph.loadJSON({
              id: -1,
              name: "OZ",
              children: data
            });
            rgraph.graph.eachNode(function (n) {
              var pos = n.getPos();
              pos.setc(-200, -200);
            });
            rgraph.compute('end');
            rgraph.fx.animate({
              modes: ['polar'],
              duration: 500
            });

            Ember.$('#loading-message').remove();
          }).catch((err) => {
            this.get('errorHandler').handleError(err, 'Unable to load the list of infections.');
          });
        });
      });
    }
  }
});
