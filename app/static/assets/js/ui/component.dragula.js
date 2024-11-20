!(function (r) {
    "use strict";
    function t() {
      this.$body = r("body");
    }
    (t.prototype.init = function () {
      r('[data-plugin="dragula"]').each(function () {
        var t = r(this).data("containers"),
          a = [];
  
        // Verifica se t é uma string e converte para um array
        if (typeof t === "string") {
          // Remove os colchetes e substitui as aspas simples por aspas duplas
          t = t.replace(/'/g, '"').replace(/^\[|\]$/g, ""); // Remove colchetes
          // Converte a string para um array
          t = JSON.parse("[" + t + "]"); // Adiciona colchetes para formar um array válido
        }
  
        if (Array.isArray(t)) {
  
          for (var n = 0; n < t.length; n++) {
            var container = r("#" + t[n].trim()); // Use trim() para remover espaços
            if (container.length) {
              a.push(container[0]);
            } else {
              console.warn("Container não encontrado:", t[n]);
            }
          }
        } else {
          console.warn("t não é um array ou string");
          a = [r(this)[0]];
        }
  
        var i = r(this).data("handleclass");
        i
          ? dragula(a, {
              moves: function (t, a, n) {
                return n.classList.contains(i);
              },
            })
          : dragula(a);
      });
    }),
      (r.Dragula = new t()),
      (r.Dragula.Constructor = t);
  })(window.jQuery),
    (function () {
      "use strict";
      window.jQuery.Dragula.init();
    })();