import { useEffect, useState } from 'react'
import './Game.css'
import Chat from './Chat'
import NavBar from './NavBar';
import { useAuth } from '../contexts/AuthContext'

class SudokuSolver {
    public solve = (grid: string[][]) => {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) {
            return grid;
        }
        const [row, col] = emptyCell;
        for (let i = 1; i < 10; i++) {
            if (this.isValidNumber(grid, row, col, String(i))) {
                grid[row][col] = String(i);
                if (this.solve(grid)) {
                    return grid;
                }
                grid[row][col] = '';
            }
        }
        return null;
    }
    private findEmptyCell = (grid: string[][]) => {
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {
                if (grid[i][j] === '') {
                    return [i, j];
                }
            }
        }
        return null;
    }
    private isValidNumber = (grid: string[][], row: number, col: number, value: string) => {
        const columnValues = grid.map(r => r[col]);
        const rowValues = grid[row];
        const subGridRowStart = Math.floor(row / 3) * 3;
        const subGridRowEnd = subGridRowStart + 3;
        const subGridColStart = Math.floor(col / 3) * 3;
        const subGridColEnd = subGridColStart + 3;
        if (columnValues.includes(value)) {
            // console.log('column contains value')
            return false;
        }
        if (rowValues.includes(value)) {
            // console.log('row contains value');
            return false;
        }
        for (let i = subGridRowStart; i < subGridRowEnd; i++) {
            for (let j = subGridColStart; j < subGridColEnd; j++) {
                if (grid[i][j] === value) {
                    // console.log('sub-grid contains value');
                    return false;
                }
            }
        }
        // console.log('value is a valid input');
        return true;
    }
}

const sudokuSolver = new SudokuSolver();

const Game: React.FC = () => {
    const grid = new Array(9).fill('').map(() => new Array(9).fill(''));
    const [sudokuGrid, setSudokuGrid] = useState<string[][]>(grid);
    const [fixedValues, setFixedValues] = useState<number[][]>([]);
    const [solved, setSolved] = useState<boolean>(false);
    const [solution, setSolution] = useState<string[][]>([]);
    const [nonProvidedValuesSolution, setNonProvidedValuesSolution] = useState<number[][]>([]);

    const { isLoggedIn, username } = useAuth();

    const solveGrid = () => {
        setSolution(() => {
            const copyGrid = sudokuGrid.map(row => [...row]);
            const result = sudokuSolver.solve(copyGrid);
            if (result !== null) {
                return result;
            } else {
                alert('No solution found!');
                return sudokuGrid;
            }
        })
        setSolved(() => true);

    };
    const giveHint = () => {
        if (solved && solution) {
            let [row, col] = [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)];
            while (fixedValues.includes([row, col]) || sudokuGrid[row][col] !== '') {
                row = Math.floor(Math.random() * 9);
                col = Math.floor(Math.random() * 9);
            }
            setNonProvidedValuesSolution(() => {
                const newArray = nonProvidedValuesSolution.map(pair => [...pair]);
                newArray.push([row, col]);
                return newArray;
            })
            const gridCopy = sudokuGrid.map(row => [...row]);
            gridCopy[row][col] = solution[row][col];
            setSudokuGrid(gridCopy);
        }
    }
    const isValidNumber = (row: number, col: number, value: string) => {
        const columnValues = sudokuGrid.map(r => r[col]);
        const rowValues = sudokuGrid[row];
        const subGridRowStart = Math.floor(row / 3) * 3;
        const subGridRowEnd = subGridRowStart + 3;
        const subGridColStart = Math.floor(col / 3) * 3;
        const subGridColEnd = subGridColStart + 3;
        if (columnValues.includes(value)) {
            return false;
        }
        if (rowValues.includes(value)) {
            return false;
        }
        for (let i = subGridRowStart; i < subGridRowEnd; i++) {
            for (let j = subGridColStart; j < subGridColEnd; j++) {
                if (sudokuGrid[i][j] === value) {
                    return false;
                }
            }
        }
        return true;
    };
    const checkHasWon = () => {
        // console.log('check has won has been called');
        const gridCopy = sudokuGrid.map(row => [...row]);
        for (let i = 0; i < 9; i++) {
            const subGridRowStart = Math.floor(i / 3) * 3;
            const subGridRowEnd = subGridRowStart + 3;
            const rowCopy = gridCopy[0];
            for (let j = 0; j < 9; j++) {
                const colCopy = gridCopy.map(row => row[j]);
                if (gridCopy[i][j] === '') return false;
                let rowIndices: string[] = rowCopy.filter(val => val === gridCopy[i][j]);
                if (rowIndices.length > 1) return false;
                let colIndices: string[] = colCopy.filter(val => val === gridCopy[i][j]);
                if (colIndices.length > 1) return false;
                const subGridColStart = Math.floor(j / 3) * 3;
                const subGridColEnd = subGridColStart + 3;
                let subGridValues: string[] = [];
                for (let k = subGridRowStart; k < subGridRowEnd; k++) {
                    for (let l = subGridColStart; l < subGridColEnd; l++) {
                        subGridValues.push(gridCopy[k][l]);
                    }
                }
                // console.log('subGridValues:', subGridValues);
                let countOfValue = 0;
                for (let m = 0; m < subGridValues.length; m++) {
                    if (subGridValues[m] === gridCopy[i][j]) {
                        countOfValue++;
                    }
                }
                if (countOfValue > 1) return false;
            }
        }
        // console.log('returning true');
        return true;
    }
    const changeGridValue = (row: number, col: number, value: string) => {
        if (isValidNumber(row,col,value)) {
            setSudokuGrid(() => {
                const newGrid = [...sudokuGrid];
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (i === row && j === col && Number(value) > 0 && Number(value) < 10) {
                            newGrid[row][col] = value;
                        }
                    }
                }
                return newGrid;
            })
        }
    };
    
    const clearGrid = () => {
        const newGrid = new Array(9).fill('').map(() => new Array(9).fill(''));
        setSudokuGrid(() => newGrid);
    };
    const generateGrid = () => {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                setSudokuGrid(() => {
            let firstRow = new Array(9).fill('').map((_, index) => String(index+1));
            // console.log('firstRow starts as:', firstRow);
            let result = new Array(9).fill('');
            for (let i = 0; i < 9; i++) {
                const randomIndex = Math.floor(Math.random() * (9-i));
                // console.log('i is:', i, 'randomIndex is:', randomIndex);
                result[i] = firstRow[randomIndex];
                // console.log(`result[${i}] is:`, result[i], `firstRow[${randomIndex}] is:`, firstRow[randomIndex]);
                firstRow = firstRow.filter((_, index) => index !== randomIndex);
            }
            // console.log('result', result);
            let emptyGrid = new Array(9).fill('').map(() => new Array(9).fill(''));
            const newGrid = emptyGrid.map((row, index) => {
                if (index === 0) {
                    return result;
                } else {
                    return row;
                }
            });
            const solvedGrid = sudokuSolver.solve(newGrid);
            let removedValues = 0;
            if (solvedGrid) {
                while (removedValues < 60) {
                    const [row, col] = [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)];
                    if (solvedGrid[row][col] !== '') {
                        solvedGrid[row][col] = '';
                        removedValues++;
                    }
                }
                updateFixedValues(solvedGrid);
                return solvedGrid;
            }
            return sudokuGrid;
        })
            }, 100 * i)
        }
        setSolved(() => false);
        setSolution(() => []);
        setNonProvidedValuesSolution(() => []);
    };
    const updateFixedValues = (grid: string[][]) => {
        // console.log('called updateFixedValues');
        setFixedValues(() => {
            let fixedValuesArray: number[][] = [];
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (grid[i][j] !== '') {
                        fixedValuesArray.push([i,j]);
                    }
                }
            }
            // console.log('returning fixedValuesArray:', fixedValuesArray);
            return fixedValuesArray;
        })
    }
    
    useEffect(() => {
        generateGrid();
        // console.log('fixedValues:', fixedValues);
    }, [])
    useEffect(() => {
        if (checkHasWon()) {
            alert('You have won!');
            setTimeout(() => {
                generateGrid();
            }, 5000)
        }
    }, [sudokuGrid])
    return (
        <>
            <NavBar />
            <div className="game-container">
                <span className="welcome-title">Welcome to my Sudoku game!</span>
                <div className="functionality-container">
                    <div className="sudoku-container">
                        <div className="grid-container">
                            {sudokuGrid.map((row, row_index) => (
                                <div key={`row-${row_index}`} className="row-container">
                                    {row.map((cell, column_index) => (
                                        <div key={`${row_index}-${column_index}`} className="cell-container">
                                            <input disabled={fixedValues.some(([r,c]) => r === row_index && c === column_index) ? true : false} style={fixedValues.some(([r,c]) => r === row_index && c === column_index) ? {color: 'red'} : (nonProvidedValuesSolution.some(([r,c]) => r === row_index && c === column_index) ? {color: 'green'} : undefined)} value={cell || ''} onChange={e => changeGridValue(row_index, column_index, e.target.value)} type="text" className="input-cell" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="sudoku-controls">
                            <button onClick={() => clearGrid()} className="clear-grid-button">Clear Grid</button>
                            <button onClick={() => generateGrid()} className="generate-grid-button">Generate Grid</button>
                            <button disabled={solved} onClick={() => solveGrid()} className="solve-grid-button">Solve</button>
                            <button disabled={!solved} onClick={() => giveHint()} className="give-hint-button">Hint</button>
                        </div>
                    </div>
                    {isLoggedIn && username && <Chat />}
                </div>
            </div>
        </>
    )
}

export default Game