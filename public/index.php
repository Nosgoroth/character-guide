<?php

require "_common.php";

//echo "<pre>";var_dump($characterData);die();

?><!doctype html>
<html lang="en">
  <head>
    
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><?= htmlspecialchars($config["title"]) ?></title>

    <? if (isset($config["ga"])) { ?>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?= urlencode($config["ga"]) ?>"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', <?= json_encode($config["ga"]) ?>);
        </script>
    <? } ?>


    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous" />

    <script type="text/javascript">
        window.data = {
            maxvolume: <?= json_encode(isset($config["maxvolume"]) ? $config["maxvolume"] : "auto") ?>,
            defaultVolume: <?= json_encode(isset($config["defaultVolume"]) ? $config["defaultVolume"] : "store") ?>,
            defaultBookmode: <?= json_encode(isset($config["defaultBookmode"]) ? $config["defaultBookmode"] : "all") ?>,
            showBookmodeSelect: <?= json_encode(isset($config["showBookmodeSelect"]) ? $config["showBookmodeSelect"] : false) ?>,
            searchInBlurb: <?= json_encode(isset($config["searchInBlurb"]) ? $config["searchInBlurb"] : true) ?>,
            tagBooks: <?= json_encode(isset($config["tagBooks"]) ? $config["tagBooks"] : "auto") ?>,
            characters: <?= json_encode($characterData) ?>
        };
    </script>

  </head>
  <body>

    <header class="header">
        <div class="container">
            <div class="page-header">
                <? if (isset($config["welcome"])) { ?>
                    <button id="info-button" class="btn btn-sm btn-info float-right">info</button>
                <? } ?>
                
                <h1><?= htmlspecialchars($config["title"]) ?></h1>
                
                <? if (isset($config["lead"])) { ?>
                    <p class="lead"><?= $config["lead"] ?></p>
                <? } ?>
            </div>    
        </div>
    </header>

    <div class="container" id="content">


        <? if (isset($config["welcome"])) { ?>
            <div id="info-block" class="alert alert-info" style="display: none;">
                <button type="button" class="close"><span>&times;</span></button>
                <?= $config["welcome"] ?>
            </div>
        <? } ?>
        
        <form id="controls" class="form-inline">
            <div class="form-group book">
                <label for="book">I've read up to <span class="value">book 1</span></label>
                <input type="range" class="form-control-range" id="book" />
            </div>
            <div class="form-group bookmode" style="display: none;">
                <label for="bookmode">Show from </label>
                <select id="bookmode">
                    <option value="all" selected="selected">all books I've read</option>
                    <option value="latest">the latest book I've read</option>
                </select>
            </div>

            <div class="form-group tags">
                <label for="tags">Tags:</label>
                <select id="tags" multiple="multiple"></select>
            </div>
            <div class="form-group filter">
                <label for="filter">Filter:</label>
                <input type="text" id="filter" placeholder="Enter text..."></select>
            </div>
            <!--
            <div class="form-group sort">
                <label for="sort">Sort by</label>
                <select id="sort">
                    <option value="appearance" selected="selected">appearance</option>
                    <option value="name">name</option>
                </select>
            </div>
            -->
        </form>


        <div id="dpResults">
            
        </div>
        
    </div>

    <? if (isset($config["attribution"])) { ?>
        <footer class="footer">
            <div class="container"><?= $config["attribution"] ?></div>
        </footer>
    <? } ?>

    <script src="//code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="//stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js" integrity="sha384-smHYKdLADwkXOn1EmN1qk/HfnUcbVRZyYmZ4qpPea6sjB/pTJ0euyQp0Mk8ck+5T" crossorigin="anonymous"></script>

    <!-- https://github.com/silviomoreto/bootstrap-select -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.4/js/bootstrap-select.min.js"></script>
    <link rel="stylesheet" type="text/css" href="//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.4/css/bootstrap-select.min.css" />
    
    <script src="//cdnjs.cloudflare.com/ajax/libs/chosen/1.8.5/chosen.jquery.min.js"></script>
    <link rel="stylesheet" type="text/css" href="//cdnjs.cloudflare.com/ajax/libs/chosen/1.8.5/chosen.min.css" />

    <link rel="stylesheet" type="text/css" href="inc/style.css" />
    <script src="inc/characterIndex.js"></script>
  </body>
</html>