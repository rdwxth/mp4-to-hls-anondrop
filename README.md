## This project is just a Proof Of Concept and still a WIP

# MP4 to HLS Converter and Auto Uploader

This project is a client-side application that converts MP4 files to HLS format and automatically uploads them to Anondrop, returning an M3U8 link. The application is built using React and FFmpeg.

## Features

- Convert MP4 files to HLS format
- Upload converted files to Anondrop
- Retrieve and display the M3U8 link

## Technologies Used

- React
- FFmpeg (client-side)

## Getting Started

### Prerequisites

- Node.js
- npm (or yarn)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/rdwxth/mp4-to-hls-converter.git
    cd mp4-to-hls-converter
    ```

2. Install dependencies:
    ```bash
    pnpm install
    ```

### Running the Application

1. Start the development server:
    ```bash
    pnpm start
    ```

2. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. Upload an MP4 file using the file input.
2. Wait to start the conversion process.
3. Once the conversion is complete, the file will be automatically uploaded to Anondrop.
4. The M3U8 link will be displayed on the screen.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [FFmpeg](https://ffmpeg.org/)
- [Anondrop](https://anondrop.com/)
