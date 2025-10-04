import { Button, Menu, Portal } from "@chakra-ui/react"

const sampleAsteroids = [
    { id: '1', name: 'Ceres' },
    { id: '2', name: 'Pallas' },
    { id: '3', name: 'Vesta' },
]

const AsteroidDropdown = ({ asteroids = sampleAsteroids }) => {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button variant="outline" size="sm">
                    Asteroids
                </Button>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        {asteroids.map((asteroid) => (
                            <Menu.Item value={asteroid.id}>{asteroid.name}</Menu.Item>
                        ))}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    )
}

export default AsteroidDropdown;
