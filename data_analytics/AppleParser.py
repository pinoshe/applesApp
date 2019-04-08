import csv
import Apple

import matplotlib.pyplot as plt
import sys


class AppleParser:
    def __init__(self, filename, filepath):
        self.file = filename
        self.filepath = filepath
        self.apples_csv = 0
        self.apple_list = []
        self.csv_list = []

        self.read_csv()
        self.create_apple_list()

    def read_csv(self):
        try:
            with open(self.filepath + self.file + ".csv", "r") as csvfile:
                self.apples_csv = csv.reader(csvfile, delimiter=" ")
                for line in self.apples_csv:
                    self.csv_list.append(line)
                del self.csv_list[0]
        except EnvironmentError as err:
            sys.stdout.write("open file err: " + str(err))
            sys.stdout.flush()

    def line_to_apple(self, line):
        data = line[0].split(",")
        return data

    def create_apple_list(self):
        for line in self.csv_list:
            apple_data = self.line_to_apple(line)
            self.apple_list.append(
                Apple.Apple(
                    float(apple_data[0]),
                    apple_data[1],
                    float(apple_data[2]),
                    float(apple_data[3]),
                    float(apple_data[4]),
                    float(apple_data[5]),
                )
            )
        sys.stdout.write(str(self.csv_list))
        sys.stdout.flush()

    def get_list(self):
        return self.apple_list

    def show_map(self):
        for i in range(self.apple_list.__len__()):
            plt.plot(
                self.apple_list[i].pos[0],
                self.apple_list[i].pos[1],
                color=self.apple_list[i].color,
                marker="o",
                linestyle="",
                markersize=self.apple_list[i].size,
            )
        plt.show()

    def send_list(self):
        sys.stdout.write(" ".join(str(x) for x in self.apple_list))
        sys.stdout.flush()


if __name__ == "__main__":

    if len(sys.argv) > 1:
        filename = sys.argv[1]
        filepath = sys.argv[2]
    else:
        filename = "ExampleMap"
        filepath = ""

    parser = AppleParser(filename, filepath)
    # parser.send_list()
    # parser.show_map()
    sys.exit(0)
