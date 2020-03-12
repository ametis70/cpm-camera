import os, sys, random
import argparse

parser = argparse.ArgumentParser(description='Process an image uploaded to the server.')
parser.add_argument('filename', action='store',
                    help='Filename of photo to process')
parser.add_argument('city', action='store',
                    help='City of the visitor')
parser.add_argument('school', action='store',
                    help='School of the visitor')
parser.add_argument('age', action='store',
                    help='Age of the visitor')

args = parser.parse_args()

print(args.filename)

sys.exit(0);
