import _ from '../../lib/lodash';

class SupplyLines {

    static populateSupplyLines( regionsById, targetRegionId ) {
        const supplyLinesByRegionId = {};
        _.each(regionsById, (region) => {
            if(!region.inPlay()) {
                return;
            }

            if((_.indexOf(_.map(region.adjacent, 'id'), targetRegionId) >= 0 )) {
                return;
            }

            this.findPathsToRegion(supplyLinesByRegionId, regionsById, region.id, targetRegionId);
        });
        _.each(supplyLinesByRegionId, function (supplyLines, regionId) {
            const updatedSupplyLines =_(supplyLines).map(function(supplyLine) {
                const dereferenced = _(supplyLine).tail().map(function(lineSegmentRegionId) {
                    return regionsById[lineSegmentRegionId];
                } ).value();
                return dereferenced;
            }).sortBy('length').value();
            regionsById[regionId].supplyLines = updatedSupplyLines;
        });
    }

    static findPathsToRegion(supplyLinesByRegionId, regionsById, regionId, cisalpinaId) {
        supplyLinesByRegionId[regionId] = [];
        const visited = [regionId];
        this.depthFirst(supplyLinesByRegionId, regionsById, cisalpinaId, visited);
    }

    static depthFirst(supplyLinesByRegionId, regionsById, cisalpinaId, visited) {
        const adjacentRegions = regionsById[_.last(visited)].adjacent;

        _.each(adjacentRegions, function(region) {
            if(_.indexOf(visited, region.id) >= 0) {
                return;
            }

            if(region.id === cisalpinaId) {
                supplyLinesByRegionId[_.first(visited)].push(_.clone(visited));
                return false;
            }
        });

        _.each(adjacentRegions, (region) => {
            if (_.indexOf(visited, region.id) >= 0 ||
                _.intersection(_.initial(visited), _.map(region.adjacent, 'id')).length > 0 ||
                (_.indexOf(_.map(adjacentRegions, 'id'), cisalpinaId) >= 0 && _.indexOf(_.map(region.adjacent, 'id'), cisalpinaId) >= 0) ||
                region.id === cisalpinaId) {
                return;
            }
            visited.push(region.id);
            this.depthFirst(supplyLinesByRegionId, regionsById, cisalpinaId, visited);
            visited.pop();
        });
    }
}

export default SupplyLines;