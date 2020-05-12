const defaultOptions = {
  onTileClick: (target) => {
    console.log(target);
  },
  isNewTabLink: () => false,
  ribbon: () => "",
  isLink: () => true,
  isActive: () => true,
  shouldRender: () => true,
  href: () => null,
  backgroundColor: (tile) => tile.backgroundColor,
  color: (tile) => tile.color,
  header: (tile) => tile.header,
  footer: (tile) => tile.footer,
  title: (tile) => tile.title,
  icon: (tile) => tile.icon,
};

class TilesManager {
  constructor(
    divID,
    labels = [],
    tiles = [],
    initialTabStates = [],
    options = {}
  ) {
    this.labels = labels;
    this.tiles = tiles;
    this.initialTabStates = initialTabStates;
    this.divID = divID;
    this.options = { ...defaultOptions, ...options };
  }

  repaint() {
    repaint(
      this.divID,
      this.labels,
      this.tiles,
      this.initialTabStates,
      this.options
    );
  }
}

function repaint(divID, labels, tabsTiles, initialTabStates, options) {
  const $div = $("#" + divID);
  $div.empty();

  for (let index = 0; index < labels.length; index++) {
    const label = labels[index];
    const tiles = tabsTiles[index];
    const state = initialTabStates[index];
    const $tab = buildTab(index, label, tiles, state, options);
    $div.append($tab);
  }
}

function renderTabTiles(tiles) {
  const $tileContainer = $(`<div id="tile_container">`);
  $tileContainer.addClass("on-tabs-tiles");
  if (!tiles) {
    $tileContainer.append("No tiles");
  } else {
    $tileContainer.append(tiles.map(getTile));
  }
  $tileContainer.on("click", function (event) {
    let $el;
    if ($(event.target).hasClass("cell")) {
      $el = $(event.target);
    } else {
      $el = $(event.target).parents(".cell").first();
    }
    let idx = $el.attr("data-idx");
    const tile = tiles[idx];
    if (tile && options.isActive(tile) && !options.isNewTabLink(tile)) {
      options.onTileClick(event, tile, $el);
    }
  });
  $div.append($tileContainer);
}
function buildTab(id, label, tiles, state, options) {
  const $mainContainer = $(`<div id="container_${label}">`);

  const $label = $(
    `<h2 class="label ${
      state == 1 && "selected"
    }" id="label_${label}">${label}</h2>`
  );
  const $tileContainer = $(
    `<div class="tile_container ${state == 1 ? "opened" : "closed"}">`
  );

  $tileContainer.addClass("on-tabs-tiles");
  if (!tiles) {
    $tileContainer.append("No tiles");
  } else {
    $tileContainer.append(tiles.map(getTile));
  }

  $tileContainer.on("click", function (event) {
    let $el;
    if ($(event.target).hasClass("cell")) {
      $el = $(event.target);
    } else {
      $el = $(event.target).parents(".cell").first();
    }
    let idx = $el.attr("data-idx");
    const tile = tiles[idx];
    if (tile && options.isActive(tile) && !options.isNewTabLink(tile)) {
      options.onTileClick(event, tile, $el);
    }
  });

  $label.on("click", function (event) {
    $tileContainer.toggleClass("closed opened");
    $label.toggleClass("selected");

    $mainContainer.siblings().children(".opened").toggleClass("opened closed");
    $mainContainer.siblings().children(".selected").toggleClass("selected");

    window.localStorage.setItem(
      "opened_tab",
      $tileContainer.hasClass("opened") ? id : undefined
    );
  });

  $mainContainer.append($label);
  $mainContainer.append($tileContainer);

  return $mainContainer;

  function getTile(tile, idx) {
    if (Object.keys(tile).length === 1) {
      return '<div style="width: 100%"></div>';
    }

    if (!options.shouldRender(tile)) return "";
    const ribbon = options.ribbon(tile);
    const active = options.isActive(tile);
    const header = options.header(tile);
    const footer = options.footer(tile);
    const title = options.title(tile);
    const icon = options.icon(tile);
    const href = options.href(tile);
    const newTabLink = options.isNewTabLink(tile);
    const size = getSize(title);

    let iconType = /(fa|ci-icon)-/.exec(icon);
    if (iconType) iconType = iconType[1];
    const $el = $(`
                <div class="cell ${active ? "active" : "inactive"}">
                    <div class='content'>
                     <h5 class='header'>${header || ""}</h5>
                        ${
                          icon
                            ? `<div class="${iconType} ${icon} icon main huge"></div>`
                            : `<div class="title main ${size}">${
                                title || ""
                              }</div>`
                        }
                        <div class="footer">${footer || ""}</div>
                        ${
                          ribbon
                            ? `<div class="ribbon-wrapper"><div class="ribbon beta">${ribbon}</div></div>`
                            : ""
                        }
                    </div>
                </div>
        `);

    $el.css({
      color: options.color(tile),
      backgroundColor: options.backgroundColor(tile),
      cursor: active && options.isLink(tile) ? "pointer" : "inherit",
    });

    $el.attr({
      "data-idx": idx,
    });
    if (newTabLink && active && href) {
      return $el
        .wrap(
          `<a href="${href}" target="_blank" style="text-decoration: none; color: initial;" />`
        )
        .parent();
    }
    return $el;
  }

  function getSize(text) {
    if (text === undefined) return "huge";
    const asText = String(text);
    if (asText.length <= 3) {
      return "huge";
    } else if (asText.length <= 6) {
      return "large";
    } else {
      return "medium";
    }
  }
}
