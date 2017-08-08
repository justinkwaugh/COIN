import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RemoveResources from 'fallingsky/actions/removeResources';
import DevastateRegion from 'fallingsky/actions/devastateRegion';
import EnemyFactionPriority from 'fallingsky/bots/belgae/enemyFactionPriority';
import Losses from 'fallingsky/util/losses';

class Event49 {
    static handleEvent(state) {

        _.each(state.factions, faction => {
            if (faction.id === FactionIDs.GERMANIC_TRIBES) {
                return;
            }
            const resourcesToRemove = faction.resources() - Math.floor(faction.resources() / 2);
            RemoveResources.execute(state, {
                factionId: faction.id,
                count: resourcesToRemove
            });
        });

        const targetDevastateRegion = _(state.regions).reject(region => region.devastated()).map(region => {
            const devastateResults = _.reduce(EnemyFactionPriority, (accumulator, factionPriority, factionId) => {
                const pieces = region.getPiecesForFaction(factionId);
                const piece = _.first(Losses.orderPiecesForRemoval(state, pieces));

                if (piece) {
                    if (piece.type === 'legion') {
                        accumulator.legions += 1;
                    }
                    else if (piece.type === 'citadel') {
                        accumulator.citadels += 1;
                    }
                    else if (piece.type === 'leader') {
                        accumulator.other += 1;
                    }
                    else if (piece.type === 'fort') {
                        accumulator.other += 1;
                    }
                    else if (piece.type === 'alliedtribe') {
                        accumulator.allies += 1;
                    }
                    else if (piece.type === 'auxilia') {
                        accumulator.other += 1;
                    }
                    else if (piece.type === 'warband') {
                        accumulator.other += 1;
                    }
                }

                return accumulator;
            }, {legions: 0, citadels: 0, allies: 0, other: 0});

            const priority = (99-devastateResults.legions) + '-' +
                             (99-devastateResults.citadels) + '-' +
                             (99-devastateResults.allies) + '-' +
                             (99-devastateResults.other);

            return {
                region,
                priority
            }
        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('region').first();

        if(targetDevastateRegion) {
            DevastateRegion.execute(state, {
                regionId: targetDevastateRegion.id
            });
        }

        _(state.regions).filter(region=>region.devastated()).each(region=> {
            _.each(state.playersByFaction, (player, factionId) => {
                const pieces = region.getPiecesForFaction(factionId);
                if(pieces.length === 0) {
                    return;
                }

                player.removePieces(state, region, 1);
            });
        });


        return true;
    }
}

export default Event49;