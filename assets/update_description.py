import os
import re

title = "# Descripciones de las instancias\n\n"
main_filepath = "./descripciones.md"
instance_description_filename = "descripcion-de-la-instancia.md"


class Instance:
    def __init__(self, directory_name, file_contents):
        self.directory_name = directory_name
        self.file_contents = file_contents
        match = re.search(r"## Descripción\s+(.+)\s+##", file_contents)

        if match is not None:
            self.description = match.group(1)
        else:
            raise Exception("Could not get the description")


def markdown_index(instances):
    index = "## Índice de contenidos\n\n"

    for x in instances:
        index += f"- `{x.directory_name}`: {x.description}\n"

    return index


instances = []

for elem in os.listdir("."):
    if os.path.isdir(elem) and elem.startswith("anchieta"):
        with open(f"./{elem}/{instance_description_filename}", mode="r", encoding="utf-8") as instance_description:
            instances.append(Instance(elem, instance_description.read()))

with open(main_filepath, mode="w", encoding="utf-8") as output:
    output.write(title)
    output.write(markdown_index(instances) + "\n\n")

    for i in instances:
        output.write(i.file_contents + "\n\n")
