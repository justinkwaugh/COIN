import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import EnemyFactionPriority from 'fallingsky/bots/arverni/enemyFactionPriority';
import Battle from 'fallingsky/commands/battle';

import MovePieces from 'fallingsky/actions/movePieces';


class Event62 {
    static handleEvent(state) {
        const validRegions = _(state.regions).shuffle().filter(
            region => _.indexOf([RegionIDs.PICTONES, RegionIDs.ARVERNI, RegionIDs.BRITANNIA], region.id) >= 0 || _.find(
                region.adjacent, adjacent => adjacent.id === RegionIDs.BRITANNIA)).value();


        const targetEnemies = _.reject(_.keys(EnemyFactionPriority),
                                       factionId => state.playersByFaction[factionId].isNonPlayer);

        const target = _(validRegions).map(region => {
            const enemyFaction = _.find(targetEnemies,
                                        enemyFactionId => region.getPiecesForFaction(enemyFactionId).length > 0);
            if (!enemyFaction) {
                return;
            }

            const arverniControlMargin = region.controllingMarginByFaction()[FactionIDs.ARVERNI];
            if (arverniControlMargin > 0) {
                return;
            }

            const movedPieces = _.reduce(validRegions, (accumulated, sourceRegion) => {
                if (sourceRegion.id === region.id) {
                    return accumulated;
                }

                const arverniMobile = sourceRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI);
                return _.concat(accumulated, arverniMobile);
            }, []);

            if ((arverniControlMargin + movedPieces.length) <= 0) {
                return;
            }

            const battlingPieces = _.concat(region.getMobilePiecesForFaction(FactionIDs.ARVERNI), movedPieces);

            const battleResults = Battle.test(state, {
                region: region,
                attackingFactionId: FactionIDs.ARVERNI,
                defendingFactionId: enemyFaction,
                attackingPieces: battlingPieces
            });

            if (battleResults.defenderLosses.normal === 0) {
                return;
            }

            return {
                region,
                enemyFaction,
                priority: '' + _.indexOf(targetEnemies, enemyFaction)
            }

        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

        if (!target) {
            return false;
        }

        _.each(validRegions, sourceRegion => {
            if (sourceRegion.id === target.region.id) {
                return;
            }

            const pieces = sourceRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI);
            if (pieces.length === 0) {
                return;
            }

            MovePieces.execute(state, {
                sourceRegionId: sourceRegion.id,
                destRegionId: target.region.id,
                pieces: pieces
            });
        });

        const turn = state.turnHistory.currentTurn;
        turn.startCommand(CommandIDs.BATTLE);

        const battleResults = Battle.test(state, {
            region: target.region.id,
            attackingFactionId: FactionIDs.ARVERNI,
            defendingFactionId: target.enemyFaction,
        });

        Battle.execute(state, {
            battleResults
        });

        turn.commitCommand();
        turn.popContext();

        return true;
    }


}

export default Event62
