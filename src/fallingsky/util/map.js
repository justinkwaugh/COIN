import _ from '../../lib/lodash';

class Map {

    static cartesianProduct(arr) {
        return arr.reduce((a, b) => a.map(x => b.map(y => x.concat(y))).reduce((a, b) => a.concat(b), []), [[]]);
    }

    static findMinimumAdjacent(regions) {
        const numRegions = regions.length;
        const regionIds = _.map(regions, 'id');
        const possibleDestinationIds = _(regions).map(
            region => _(region.adjacent).map('id').reject(id => _.indexOf(regionIds, id) >= 0).value()).value();
        const union = _.reduce(possibleDestinationIds, (union, destinations) => _.union(union, destinations), []);
        const rankings = this.generateRankings(union, possibleDestinationIds);
        const groupedRankings = _.groupBy(rankings, 'count');

        if (groupedRankings[numRegions]) {
            return _.map(
                groupedRankings[numRegions], ranking => [ranking]);
        }

        let solutions = [];
        const groupsToCheck = _.range(1, numRegions).reverse();
        _.each(
            groupsToCheck, (groupId) => {
                const rankingGroup = groupedRankings[groupId];
                const solutionsForGroup = this.generateSolutionsForGroup(rankings, groupedRankings, rankingGroup, groupId);
                if (solutionsForGroup.length > 0) {
                    solutions = solutionsForGroup;
                    return false;
                }
            });

        if(solutions.length === 0) {
            // No combinations with larger groups worked, so cartesian product it is.
            solutions = this.cartesianProduct(_(regions).map('adjacent').value());
        }
        return solutions;
    }

    static findPathsToRegion(state, startRegionId, targetId, limit=10) {
        const paths = [];
        const visited = [startRegionId];
        this.depthFirst(paths, state.regionsById, targetId, visited, limit);
        return _.sortBy(paths, path => path.length);
    }

    static measureDistanceToRegion(state, startRegionId, targetId) {
        if(startRegionId === targetId) {
            return 0;
        }
        const paths = this.findPathsToRegion(state, startRegionId, targetId, 5); // None are more than 4 away by shortest distance
        return paths[0].length - 1;
    }

    static depthFirst(paths, regionsById, targetId, visited, limit) {
        const adjacentRegions = regionsById[_.last(visited)].adjacent;

        _.each(adjacentRegions, function(region) {
            if(_.indexOf(visited, region.id) >= 0 || !region.inPlay()) {
                return;
            }

            if(region.id === targetId) {
                visited.push(targetId);
                paths.push(_.clone(visited));
                visited.pop();
                return false;
            }
        });

        _.each(adjacentRegions, (region) => {
            if (visited.length >= limit || _.indexOf(visited, region.id) >= 0 || !region.inPlay() ||
                _.intersection(_.initial(visited), _.map(region.adjacent, 'id')).length > 0 || region.id === targetId) {
                return;
            }
            visited.push(region.id);
            this.depthFirst(paths, regionsById, targetId, visited, limit);
            visited.pop();
        });
    }

    static generateRankings(allAdjacentRegions, adjacentPerStartRegion) {
        const allSets = _.range(0, adjacentPerStartRegion.length);
        return _(allAdjacentRegions).map(
            (id) => {
                let count = 0;
                let sets = [];
                _.each(
                    adjacentPerStartRegion, (possibleIds, index) => {
                        const found = _.indexOf(possibleIds, id) >= 0;
                        if (found) {
                            count += 1;
                            sets.push(index);
                        }
                    });
                sets.sort();
                return {
                    id,
                    sets,
                    remaining: _.difference(allSets, sets),
                    count
                }
            }).sortBy('count').reverse().value();
    }

    static generateSolutionsForGroup(rankings, groupedRankings, rankingGroup, groupId) {
        let uncheckedRankings = [];
        _.each(
            _.range(1, groupId + 1).reverse(), (id) => {
                uncheckedRankings = _.concat(uncheckedRankings, groupedRankings[id]);
            });

        return _(rankingGroup).map(
            (ranking) => {
                const solutionsForRegion = [];

                if (ranking.count <= 1) {
                    return;
                }

                if (ranking.remaining.length === 0) {
                    solutionsForRegion.push([ranking.id]);
                }
                else {
                    const regions = _.clone(rankings);
                    while (regions.length > 0) {
                        const solution = [ranking];
                        let remaining = _.clone(ranking.remaining);
                        _.each(
                            regions, (otherRanking) => {
                                const difference = _.difference(remaining, otherRanking.sets);
                                if (difference.length === 0 || difference.length <= remaining.length - otherRanking.sets.length) {
                                    solution.push(otherRanking);
                                }
                                remaining = difference;
                                if (difference.length === 0) {
                                    return false;
                                }
                            });
                        solution.sort();
                        if (remaining.length === 0) {
                            solutionsForRegion.push(solution);
                        }
                        regions.shift();
                    }
                }
                return {
                    id: ranking.id,
                    solutions: solutionsForRegion
                }
            }).compact().map('solutions').flatten().uniqWith(_.isEqual).orderBy(solution => solution.length).value();

    }
}

export default Map