import Logging from '../util/logging';
import Action from './action';
import _ from '../../lib/lodash';

class RemovePieces extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.pieces = args.pieces;
        this.removalData = args.removalData;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const pieces = this.pieces;

        if(!pieces || pieces.length === 0){
            throw 'No pieces specified for remove'
        }

        this.removalData = this.getRemovalData(pieces);
        region.removePieces(pieces);

        console.log('Removing the following ' + faction.name + ' pieces from region ' + region.name);
        Logging.logPieces(pieces);

        _(pieces).groupBy('type').each(
             (piecesOfType, type) => {
                if (type === 'warband') {
                    faction.returnWarbands(piecesOfType);
                }
                else if (type === 'alliedtribe') {
                    _.each(
                        piecesOfType, function (piece) {
                            const tribe = state.tribesById[piece.tribeId];
                            console.log("removing ally for tribe " + tribe.name);
                            tribe.removeAlly(piece);
                        });
                    faction.returnAlliedTribes(piecesOfType);
                }
                else if (type === 'citadel') {
                    const piece = piecesOfType[0];
                    const tribe = state.tribesById[piece.tribeId];
                    tribe.removeAlly(piece);
                    faction.returnCitadel(piece);
                }
                else if (type === 'auxilia') {
                    faction.returnAuxilia(piecesOfType);
                }
                else if (type === 'legion') {
                    faction.returnLegions(piecesOfType);
                }
                else if (type === 'fort') {
                    faction.returnFort(piecesOfType[0]);
                }
                else if (type === 'leader') {
                    faction.returnLeader(piecesOfType[0]);
                }
            });

    }

    doUndo(state) {
        throw 'Unable to undo RemovePieces Action';
    }

    getRemovalData(pieces) {
        return _(pieces).groupBy('type').map(
             (piecesOfType, type) => {
                if (type === 'warband') {
                    return { type,
                            data: _.countBy(piecesOfType, warband => warband.status()) };
                }
                else if (type === 'alliedtribe') {
                    return { type,
                        data: _.map(piecesOfType, alliedTribe => alliedTribe.tribeId)};
                }
                else if (type === 'citadel') {
                    const piece = piecesOfType[0];
                    return { type,
                       data: piece.tribeId};
                }
                else if (type === 'auxilia') {
                    return { type,
                        data: _.countBy(piecesOfType, auxilia => auxilia.status())} ;
                }
                else if (type === 'legion') {
                    return { type,
                        data: piecesOfType.length };
                }
                else if (type === 'fort') {
                    return { type,
                        data: piecesOfType.length };
                }
                else if (type === 'leader') {
                    return { type,
                        data: { successor: piecesOfType[0].isSuccessor(),
                                title: piecesOfType[0].toString()} };
                }
            }).keyBy('type').value();
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const removalData = this.removalData;

        return _(removalData).map((pieceTypeData, type) => {
            if(type === 'warband') {
                return 'Remove ' + (pieceTypeData.data.scouted ? pieceTypeData.data.scouted + 'x scouted ' : '') +
                       (pieceTypeData.data.revealed ? pieceTypeData.data.revealed + 'x revealed ' : '') +
                       (pieceTypeData.data.hidden ? pieceTypeData.data.hidden + 'x hidden ' : '') + faction.name  + ' Warbands from ' + region.name;
            }
            else if(type === 'fort') {
                return 'Remove Roman Fort from ' + region.name;
            }
            else if(type === 'legion') {
                return 'Remove ' + pieceTypeData.data + 'x Legions from ' + region.name;
            }
            else if(type === 'auxilia') {
                return 'Remove ' +
                       (pieceTypeData.data.revealed ? pieceTypeData.data.revealed + 'x revealed ' : '') +
                       (pieceTypeData.data.hidden ? pieceTypeData.data.hidden + 'x hidden ' : '') + faction.name  + ' Auxilia from ' + region.name;
            }
            else if(type === 'leader') {
                return 'Remove ' + pieceTypeData.data.title + ' from ' + region.name;
            }
            else if(type === 'alliedtribe') {
                return 'Remove ' + pieceTypeData.data.length + 'x ' + faction.name + ' Allies' + ' from ' + _.join(pieceTypeData.data) + ' in ' + region.name;
            }
            else if(type === 'citadel') {
                return 'Remove ' + faction.name + ' Citadel' + ' from ' + pieceTypeData.data + ' in ' + region.name;
            }
        }).compact().value();
    }

}

export default RemovePieces;