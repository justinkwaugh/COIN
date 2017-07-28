import Logging from '../util/logging';
import _ from '../../lib/lodash';
import Action from './action';

class MovePieces extends Action {

    constructor(args) {
        super(args);

        this.sourceRegionId = args.sourceRegionId;
        this.destRegionId = args.destRegionId;
        this.factionId = args.factionId;
        this.pieces = args.pieces;
        this.moveData = args.moveData;
    }

    doExecute(state) {
        const sourceRegion = state.regionsById[this.sourceRegionId];
        const destRegion = state.regionsById[this.destRegionId];
        const pieces = this.pieces;

        this.factionId = pieces[0].factionId;
        this.moveData = this.getMoveData(pieces);

        sourceRegion.removePieces(pieces);
        destRegion.addPieces(pieces);

        console.log('Moving these ' + this.factionId + ' pieces from ' + sourceRegion.name + ' to ' + destRegion.name);
        Logging.logPieces(pieces);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const sourceRegion = state.regionsById[this.sourceRegionId];
        const destRegion = state.regionsById[this.destRegionId];
        _(this.moveData).each((pieceTypeData,type) => {
            if(type === 'warband') {
                const warbandsByStatus = _.groupBy(destRegion.getWarbandsOrAuxiliaForFaction(this.factionId), warband=>warband.status());
                _.each(pieceTypeData.data, (count, status) => {
                    const warbands = _.take(warbandsByStatus[status], count);
                    destRegion.removePieces(warbands);
                    sourceRegion.addPieces(warbands);
                    console.log('Returning ' + count + 'x ' + status + ' ' + faction.name + ' Warbands from ' + destRegion.name + ' to ' + sourceRegion.name);
                });
            }
            else if(type === 'auxilia') {
                const auxiliaByStatus = _.groupBy(destRegion.getWarbandsOrAuxiliaForFaction(this.factionId), auxilia=>auxilia.status());
                _.each(pieceTypeData.data, (count, status) => {
                    const auxilia = _.take(auxiliaByStatus[status], count);
                    destRegion.removePieces(auxilia);
                    sourceRegion.addPieces(auxilia);
                    console.log('Returning ' + count + 'x ' + status + ' ' + faction.name + ' Auxilia from ' + destRegion.name + ' to ' + sourceRegion.name);
                });
            }
            else if(type === 'legion') {
                const legions = _.take(destRegion.getLegions(), pieceTypeData.data);
                destRegion.removePieces(legions);
                sourceRegion.addPieces(legions);
                console.log('Returning ' + pieceTypeData.data + 'x Roman Legions from ' + destRegion.name + ' to ' + sourceRegion.name);
            }
            else if(type === 'leader') {
                const leader = destRegion.getLeaderForFaction(this.factionId);
                destRegion.removePieces([leader]);
                sourceRegion.addPiece(leader);
                console.log('Returning ' + leader.toString() + ' from ' + destRegion.name + ' to ' + sourceRegion.name);
            }
        });
    }

    getMoveData(pieces) {
        return _(pieces).groupBy('type').map(
            (piecesOfType, type) => {
                if (type === 'warband') {
                    return {
                        type,
                        data: _.countBy(piecesOfType, warband => warband.status())
                    };
                }
                else if (type === 'auxilia') {
                    return {
                        type,
                        data: _.countBy(piecesOfType, auxilia => auxilia.status())
                    };
                }
                else if (type === 'legion') {
                    return {
                        type,
                        data: piecesOfType.length
                    };
                }
                else if (type === 'leader') {
                    return {
                        type,
                        data: {
                            successor: piecesOfType[0].isSuccessor(),
                            title: piecesOfType[0].toString()
                        }
                    };
                }
            }).keyBy('type').value();
    }

    getPieceListText(moveData) {
        return _(moveData).map((data, type) =>{
            if(type === 'leader') {
                return data.data.title;
            }
            else if(type === 'legion') {
                return data.data + 'x Legions';
            }
            else if(type === 'warband') {
                const sum = _.reduce(data.data, (sum, count) => {
                    return sum + count;
                }, 0);
                return sum + 'x Warbands (' +
                (data.data.hidden || 0) + ' hidden, ' +
                (data.data.revealed || 0) + ' revealed, ' +
                (data.data.scouted || 0) + ' scouted)'
            }
            else if(type === 'auxilia') {
                const sum = _.reduce(data.data, (sum, count) => {
                    return sum + count;
                }, 0);
                return sum + 'x Auxilia (' +
                (data.data.hidden || 0) + ' hidden, ' +
                (data.data.revealed || 0) + ' revealed))'
            }
        }).value();
    }

    instructions(state) {
        const sourceRegion = state.regionsById[this.sourceRegionId];
        const destRegion = state.regionsById[this.destRegionId];
        const faction = state.factionsById[this.factionId];
        return _.map(this.getPieceListText(this.moveData), pieceString => 'Move ' + faction.name + ' ' + pieceString + ' from ' + sourceRegion.name + ' to ' + destRegion.name);
    }
}

export default MovePieces;