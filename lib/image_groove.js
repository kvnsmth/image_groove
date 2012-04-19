var ImageGroove = {
  config: {
    image_number: 56,
    image_type: ".jpg",
    text_type:  ".txt",
    anim_speed: 1700,
    image_selector: "#wrapper img",
    text_selector: "#wrapper p"
  },
  text_cache: [],
  base_path: "",
  init: function() {
    this.calculate_base_path();
    this.wrap_image();
    this.setup_click_handlers();
    this.preload_image(this.image_path(2)) 
  },
  image_path: function(number) {
    return ImageGroove.base_path + number + ImageGroove.config.image_type;
  },
  wrap_image: function() {
    $(ImageGroove.config.image_selector).wrap('<div class="outer_frame"><div class="inner_frame"></div></div>');
  },
  move: {
    left: function() {
      this._do_move(559,-1150,"decrement");
    },
    right: function() {
      this._do_move(-1150,559,"increment");
    },
    _do_move: function(margin_to_disapper, margin_to_enter, change_type) {
      var image_to_move = $(ImageGroove.config.image_selector);
      
      var current_src = image_to_move.attr("src");
      var path_elements = current_src.split('/');
      var element_number = path_elements.length;
      var current_position = parseInt(path_elements[element_number-1]);
      var next = ImageGroove.calculate_position(current_position, change_type);
      setTimeout("ImageGroove.preload_image(ImageGroove.image_path(ImageGroove.calculate_position(" + next + ", '"+ change_type + "')))", .5);
    
      /* animate image */
      image_to_move.animate({
        opacity: 0,
        marginLeft: margin_to_disapper
      }, 
      ImageGroove.config.anim_speed, 
      "easeInOutQuad",
      function() {
        image_to_move.css({marginLeft:margin_to_enter+"px"});
        image_to_move.attr("src", ImageGroove.image_path(next));
        image_to_move.animate({
          opacity: 1,
          marginLeft: 0
        }, ImageGroove.config.anim_speed, "easeInOutQuad");
      });
      /* animate text */
      $(ImageGroove.config.text_selector).fadeOut(ImageGroove.config.anim_speed, function() {
        ImageGroove.fetch_text(next,(function(node) {
          return function(text) {
            node.html("<span>"+ text +"</span>")
               .fadeIn(ImageGroove.config.anim_speed);
          }
        })($(this)));
        setTimeout("ImageGroove.fetch_text(ImageGroove.calculate_position(" + next + ", '" + change_type + "'))", .5);
      });
    }
  },
  setup_click_handlers: function() {
    $("nav").on("click", "a", function(e) {
      e.preventDefault();
      if ( $(this).hasClass("prev") ) {
        ImageGroove.move.left();
      } else {
        ImageGroove.move.right();
      }
    });
  },
  preload_image: function(image_path) {
    jQuery("<img/>").attr("src", image_path);
  },
  calculate_base_path: function() {
    var path_elements = $(ImageGroove.config.image_selector).attr("src").split("/");
    path_elements = path_elements.slice(0, path_elements.length - 1);
    ImageGroove.base_path = path_elements.join("/") + "/";
  },
  fetch_text: function(number, callback) {
    var text = ImageGroove.text_cache[number - 1];
    if(!text) {
      $.get(ImageGroove.base_path + number + ImageGroove.config.text_type,function(data) {
        ImageGroove.text_cache[number - 1] = data;
        if(callback) {
          callback(data);
        }
      }); 
    } else {
      if(callback) {
        callback(text);
      }
    }
  },
  calculate_position: function(current, change_direction) {
    if (change_direction == "increment") {
      if (current + 1 <= ImageGroove.config.image_number) {
        return current + 1;
      } else {
        return 1;
      }
    } else if (change_direction == "decrement") {        
      if (current - 1 > 0) {
        return current - 1;
      } else {
        return ImageGroove.config.image_number;
      }
    } else {
      return current;
    }
  }
};

$(function() {
  /* initialize the javascript needed for the transitions */
  ImageGroove.init();
});