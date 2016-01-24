<div ng-controller="TreeController"
     class="sidebar-content">
    <div class="root-folder">
        <div class="folder-list-item" ng-click="changeFolder(tree.root)">
            <span class="bg-container"></span>
            <h4 ng-class="{'text-muted': tree.loading}"
                ng-bind="tree.root.name"
                class="href folder"></h4>
        </div>
    </div>
    <ul class="media-list">
        <li class="media no-margin" ng-repeat="dir in tree.items" ng-include="'tree.html'"></li>
    </ul>
</div>

<script type="text/ng-template" id="tree.html">
    <div class="media-left expand-container">
        <span ng-class="{'text-muted': tree.loading}"
              ng-click="tree.expand(dir)"
              class="expand">
            <span ng-if="!isEmpty(dir)"
                  class="expand-sign glyphicon"
                  ng-class="{'glyphicon-chevron-down': isOpen(dir),'glyphicon-chevron-right': !isOpen(dir)}"></span>
            <!--<img src ng-src="{{dir.thumbs.thumb}}" width="26" height="26" class="pull-right">-->
        </span>
    </div>
    <div class="media-body">
        <div class="media-heading folder-list-item" ng-click="changeFolder(dir)">
            <span class="bg-container"></span>
            <h4 ng-class="{'text-muted': tree.loading}"
                ng-bind="dir.name"
                class="href folder"></h4>
        </div>
        <div ng-if="dir.folders">
            <div class="media no-margin" ng-repeat="dir in dir.folders" ng-include="'tree.html'"></div>
        </div>
    </div>
</script>